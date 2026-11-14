<p align="center">
  <img src="assets/icon.png" alt="Beautiful Extension: a Chrome-style four-color circle" width="160">
</p>

# Beautiful Extension

Three standard [Agent Skills](https://agentskills.io) and a lints config that
teach coding agents to write, review, port, and enforce idiomatic Chrome
extensions on **Manifest V3 + TypeScript**:

- **`extension-best-practices`** loads whenever an agent writes or changes an
  extension, and steers it toward an event-driven worker, sender-validated
  messaging, typed storage and a least-privilege manifest.
- **`extension-review`** reviews existing code — a worker, content script,
  popup, manifest, message contract, or diff — and writes a prioritized report
  where every finding cites the rule it breaks and shows the fix.
- **`extension-port`** ports MV2 background pages, Firefox/Edge extensions, or
  a web app to MV3 with the same behavior, porting the original tests first.
- **`lints/`** is a drop-in ESLint 9 flat config whose layer walls and
  no-remote-code rules run in CI.

They work with Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Gemini CLI,
and any other agent that reads the Agent Skills format.

## The playbooks

These skills are the runnable, machine-checked enforcement of the
[facta playbooks](https://github.com/Facta-Dev/ai-coding-playbook). That
repository carries the sixteen root playbooks — backend, Java/J2EE, frontend,
React Native, Android/Kotlin, iOS/Swift, desktop Qt, CLI, Chrome extension,
URLs, tests, security, audit, install, REA and the Claude Code kit — plus the
nine runnable kits (Go, Rust, Node.js, Python, Java, extension, desktop,
frontend-mobile, mobile-android), the model-routing guide and the
instruction-budget tooling. Start with
[`PLAYBOOK_CHROME_EXTENSION.md`](https://github.com/Facta-Dev/ai-coding-playbook/blob/main/PLAYBOOK_CHROME_EXTENSION.md)
for this stack, then use this repository as the worked example. The shared
contracts (`PLAYBOOK_URLS.md`, `PLAYBOOK_TESTS.md`, `PLAYBOOK_SECURITY.md`,
`PLAYBOOK_AUDIT.md`, `PLAYBOOK_CLAUDE_CODE.md`) apply across the series.

## Why

Chrome extensions fail in ways a web app does not: the service worker dies
between events, a content script runs next to hostile page code, a permission
is a store-review question, and a token in the wrong context is a
privilege-escalation path. The expensive bugs are structural:

- State in a module global, lost when Chrome terminates the worker.
- A listener registered after an `await`, so the event that woke the worker is
  never handled.
- An `onMessage` handler that trusts the sender.
- A token in `storage.local` or, worse, in a page.
- A broad host permission that makes the store review (and the enterprise
  admin) reject the build.

Beautiful Extension is the contract that catches those before review.

## Install

### Claude Code

```bash
/plugin marketplace add Facta-Dev/beautifulextension
/plugin install beautiful-extension@beautiful-extension
```

### OpenAI Codex and ChatGPT

The repository ships a portable `plugin.json` with the `com.openai` interface
block. Point Codex at the repository, or package it with:

```bash
python3 scripts/package-openai-plugin.py --out beautiful-extension.zip
```

### Any agent

Copy `skills/extension-best-practices`, `skills/extension-review`, and
`skills/extension-port` into your agent's skills directory. Each skill is a
`SKILL.md` plus a `references/` digest; no runtime, no network.

## A worked example

Without the skill, an agent writes an MV2-shaped worker that happens to load:

```tsx
// Without the skill: state in a global, a timer, and an unvalidated message.
let session = null;
setInterval(refreshSession, 60_000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "session.get") {
    sendResponse({ token: session.token });
  }
});
```

Problems: the global dies with the worker; `setInterval` dies with it too; the
handler answers any sender, including a content script; the token is handed
to whoever asked.

With the skill, the worker is event-driven, validates the sender, and the UI
asks through a typed RPC:

```tsx
// With the skill: top-level listeners, sender validation, typed storage.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void handleMessage(message, sender).then(sendResponse);
  return true; // keep the channel open for the async response
});

chrome.alarms.onAlarm.addListener((alarm) => {
  void drainJobs(alarm);
});

async function handleMessage(
  raw: unknown,
  sender: chrome.runtime.MessageSender,
): Promise<RpcResult<unknown>> {
  const request = RpcRequestSchema.safeParse(raw);
  if (!request.success) return forbidden("VALIDATION");
  const senderClass = classify(sender);
  if (senderClass === null) return forbidden("FORBIDDEN");
  if (!allowed[senderClass].has(request.data.type)) return forbidden("FORBIDDEN");
  return runUseCase(request.data, senderClass);
}
```

The layer contract, the sender table and the storage rules are in
[`skills/extension-best-practices/references/extension-architecture.md`](skills/extension-best-practices/references/extension-architecture.md).

## The architecture contract

```text
popup / side panel / options  ──►  typed RPC  ──►  service worker
content script                ──►  typed RPC  ──►  service worker
service worker:  adapters  ──►  application  ──►  domain
```

| Layer | Owns | Must not import |
|---|---|---|
| **domain** | Entities, rules, ports | `chrome.*`, DOM, React, the SDK |
| **application** | Use cases, orchestration, policy | `chrome.*`, DOM, React |
| **adapters** | Storage, messaging, SDK, alarms, identity | UI components |
| **ui** | Render, forward events, a11y | the SDK, `chrome.*` directly |
| **content** | Read/augment the page | the SDK, tokens, session |
| **core** | Ports and pure types | everything else |

The unbreakable rules:

1. Only the worker holds the session and calls the `@/sdk`.
2. `domain` and `application` never touch `chrome.*` or the DOM.
3. The page never receives a token.
4. Every message is authenticated by sender, authorized by a message
   permission table, and parsed by a schema.
5. Every permission is registered and tested.

## The lints config

[`lints/eslint.config.mjs`](lints/eslint.config.mjs) is a copy-in ESLint 9
flat config. It pins:

- **Layer walls:** `no-restricted-imports` for the UI, content scripts and the
  SDK; `no-restricted-globals` for `chrome` in domain/application.
- **No remote code:** `no-eval`, `no-new-func`, `no-debugger`, `no-alert`.
- **Type discipline:** `ban-ts-comment`, `consistent-type-imports`,
  `explicit-module-boundary-types`, `no-unnecessary-type-assertion`,
  `switch-exhaustiveness-check`.
- **Async discipline:** `no-floating-promises`, `no-misused-promises`.
- **Silencing:** eslint-comments requires a description and rejects an
  unlimited disable.
- **One logger:** `no-console`.

[`lints/check/`](lints/README.md) is the violation harness: one deliberate
file per rule with a `// expect:<rule>` marker, plus a clean control.
[`scripts/check-lints.sh`](scripts/check-lints.sh) fails if a marked rule stays
quiet, if anything unmarked fires, or if `tsc --noEmit` fails on the same
files.

## Architecture diagrams

The repo ships eight [Archify](https://github.com/tt-a1i/archify) diagrams under
[`docs/architecture/`](docs/architecture/README.md), each one a standalone HTML page
(inline SVG, dark/light themes, live motion) next to the JSON it was rendered from.

| Diagram | What it shows |
|---|---|
| [c4-containers](docs/architecture/c4-containers.html) | The extension runtime: popup, side panel, options and content script as thin clients of one service worker, the chrome.storage areas, and the product API the worker alone calls |
| [services-slices](docs/architecture/services-slices.architecture.html) | The layer contract — domain, application, adapters, ui, content, core — and the dependency walls the lints enforce |
| [auth-algorithm](docs/architecture/auth-algorithm.workflow.html) | The trust algorithm: classify the sender, check the message permission table, parse the schema, read the token from storage.session |
| [outbox-algorithm](docs/architecture/outbox-algorithm.workflow.html) | The async path: a persisted job queue drained by one chrome.alarms tick, with backoff, dead-lettering and idempotency |
| [auth-sequence](docs/architecture/auth-sequence.sequence.html) | The message trace from a UI or content script through the gate stack to the token and the API |
| [outbox-sequence](docs/architecture/outbox-sequence.sequence.html) | The alarm drain: claim, run, deliver, ack, and what a retryable or terminal failure does |
| [database-dataflow](docs/architecture/database-dataflow.dataflow.html) | Where the state goes: chrome.storage.local/session/managed and the HTTPS calls the worker alone makes |
| [runtime-lifecycle](docs/architecture/runtime-lifecycle.lifecycle.html) | The worker lifecycle: start, register the listeners, idle, wake, handle, respond — plus the rejection, enqueue and drain branches |

## What it does not do

- The skills contain instructions and reference text only. They make no
  network calls and collect no data ([PRIVACY.md](PRIVACY.md)).
- When a Node.js toolchain is available, the skills run `tsc`, `eslint`, and
  `vitest` on your project; without one, they work from the code alone.
- The lint config is a copy-in unit, not a dependency.
- The skills do not replace the Web Store policies or a security review; they
  encode the parts a reviewer would otherwise repeat.

## Repository layout

```text
skills/
  extension-best-practices/  SKILL.md + references/ (MV3 platform, patterns,
                             architecture, strict TypeScript)
  extension-review/          SKILL.md (report format, ranking, waived gates)
  extension-port/            SKILL.md (MV2/web → MV3)
lints/
  eslint.config.mjs          the drop-in
  check/                     the violation harness + byte-identical config
scripts/
  check-skill.py             frontmatter, links, evals, manifests
  check-lints.sh             every pinned rule fires
  check-examples.py          TypeScript blocks compile
  examples.json              the ledger of deliberately skipped blocks
  package-openai-plugin.py
tests/                       unit, contracts, integration, e2e
examples/
  review-extension.md        a full worked review
docs/
  architecture/              eight Archify diagrams (C4, slices, auth,
                             outbox, dataflow, lifecycle) + the index
```

## Sources

- Chrome's Manifest V3 documentation (service workers, storage, messaging,
  permissions, CSP, identity).
- The Chrome Web Store program policies (remote code, permissions, data use).
- The facta extension handbook (`PLAYBOOK_CHROME_EXTENSION.md`): contexts,
  worker lifetime, sender validation, storage migrations, enterprise policy.

## Contributing

Rule proposals are welcome; open an issue with the
[rule template](.github/ISSUE_TEMPLATE/propose-a-rule.yml) and a source. A
rule without a source and a failing example is a preference, not a rule. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## Siblings

Beautiful Extension is part of the Beautiful series for the facta playbooks:
[beautiful-j2ee](https://github.com/Facta-Dev/beautiful-j2ee),
[beautifulandroid](https://github.com/Facta-Dev/beautifulandroid),
[beautifulcli](https://github.com/Facta-Dev/beautifulcli),
[beautifulgo](https://github.com/Facta-Dev/beautifulgo),
[beautifulios](https://github.com/Facta-Dev/beautifulios),
[beautifulnodejs](https://github.com/Facta-Dev/beautifulnodejs),
[beautifulpython](https://github.com/Facta-Dev/beautifulpython),
[beautifulqt](https://github.com/Facta-Dev/beautifulqt),
[beautifulreact](https://github.com/Facta-Dev/beautifulreact),
[beautifulreactnative](https://github.com/Facta-Dev/beautifulreactnative),
[beautifulrust](https://github.com/Facta-Dev/beautifulrust).

## License

MIT — see [LICENSE](LICENSE).
