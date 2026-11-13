---
name: extension-review
description: >-
  Review Chrome extension code on Manifest V3 + TypeScript — a service worker,
  a content script, a popup or side panel, a manifest, a message contract, a
  storage migration, a diff — and produce a prioritized report where every
  finding cites the file and line, the rule it breaks, and the smallest fix.
  Use this skill whenever the user asks to review, audit, critique, or "find
  problems in" an extension, its permissions, its messaging, or its Web Store
  posture. Trigger on review, audit, code review, PR review, "what is wrong
  with this extension", "check this manifest", "review this service worker",
  or a pasted manifest/content-script/worker file. Architecture and sender
  validation always rank first.
---

# Extension review

A review is a prioritized list of findings, not a rewrite. Read the whole
change first. Every finding has four parts: **location** (file and line),
**severity**, **the rule it breaks** (named or quoted), and **the smallest
fix**. If you cannot cite a rule or a user-visible consequence, it is not a
finding; it is a preference for the Notes section, if anywhere.

## 1. Report shape

```text
## Verdict
<one paragraph: what this change does, whether it is safe to ship, and the
single most important thing to fix>

## Must fix
1. <file>:<line> — <finding>. Rule: <rule or contract>. Fix: <smallest fix>.

## Should fix
...

## Notes
...

## Waived gates
...
```

- **Must fix** blocks merge or release: a broken layer or sender-validation
  contract, a token reaching a page/content script, an unregistered permission,
  a worker state bug that loses an event, a CSP violation, a missing
  migration.
- **Should fix** is worth doing in this change or the next: a hand-written
  URL, a missing empty/error state, a retry that is not idempotent, an
  accessibility gap.
- **Notes** is optional. Do not pad the report to look thorough.

## 2. Categories, in ranking order

### Architecture contracts (always Must fix, ranked first)

A broken architecture contract (ranked above everything) is a Must fix even
when the code works. Check:

- `domain`/`application` imports `chrome.*`, the DOM, React, or the SDK.
- A UI surface (popup, side panel, options) imports the SDK or calls
  `chrome.*` instead of the typed RPC.
- A content script imports the SDK, the session, a token adapter, or writes
  durable storage directly.
- The service worker is not the single writer of durable state.
- The SDK runs outside the worker.
- A feature's message type is not in the message permission table.

Name the violated rule and quote it; the fix is to move the logic to the layer
that owns it.

### Sender validation and messaging

- An `onMessage`/`onConnect` handler does not check `sender.id`, origin/URL,
  `frameId`, the message permission table, and the payload schema.
- `onMessageExternal` trusts any origin; `externally_connectable` is wider
  than the product's own origins.
- A message from a content script or page can change policy, tokens or
  settings.
- A hand-rolled `sendMessage` in feature code instead of the typed RPC.
- Errors thrown across contexts instead of returned as values; a port that
  does not reconnect after the worker dies.
- Unknown `v`/`type` accepted silently; unknown payload fields kept.

### Manifest and permissions

- A hand-edited generated manifest, or a `manifest.json` that disagrees with
  the build config.
- A permission or host without a register entry: no feature, owner,
  justification, review date, or alternative considered.
- `<all_urls>`, broad `matches`, `all_frames: true`, or `web_accessible_
  resources` wider than needed.
- A static content script where `activeTab` or programmatic injection would
  do; a missing `run_at`/`world`.
- CSP with `unsafe-eval`/`unsafe-inline`; remote code loaded or `eval`/
  `new Function` used.
- A missing `key` (unstable extension ID) or a `storage.managed_schema`
  that does not match the policy code.
- `incognito` not decided explicitly.

### Service worker lifecycle

- A listener registered after an `await` or inside a callback; a listener
  registered only on `onInstalled`.
- Important state in a module-global variable; a handler that assumes it
  survives.
- `setInterval`/`setTimeout` for durable work instead of `chrome.alarms`.
- A long task awaited in the listener; a job queue that is not persisted, not
  idempotent, or has no backoff/dead-letter.
- `onInstalled` migrations that are not lazy on first read; a migration that
  deletes data without a backup.
- An offscreen document created without a precise `reason`, never closed, or
  used for work the worker can do.

### Storage and secrets

- A store without a schema, a version, a default, namespaced keys, or size
  accounting.
- A non-worker context writing durable state; a read-modify-write without a
  lock.
- A token in `storage.local`, a page, a message, a URL, a log, or a DOM
  attribute.
- A migration without fixtures for every released version; a downgrade path
  that silently misreads new data.
- Retention that does not clear data on sign-out or tenant switch.

### Security

- A content script or page receiving privileged data; a `postMessage` bridge
  that does not validate source, origin, schema and nonce.
- A secret in the bundle or an environment file that ships.
- A fetch to a host without the matching host permission, or a permission
  added to make one call work.
- Diagnostics or telemetry with page content, tokens, or personal data.
- A permission increase without a register update and release note.

### UI and accessibility

- A popup/side panel/options page that calls the SDK or `chrome.*` directly.
- A surface that assumes the worker is awake; no loading/error/empty state.
- An interactive `div`; an icon-only button without a name; a form field
  without a label; focus lost after a panel opens/closes.
- A side panel whose per-tab/global choice is undocumented or wrong for the
  feature.

### Tests

- No sender-validation test per message class; no invalid payload fixture.
- No worker lifecycle test (wake, double-run idempotency, restart resume).
- No migration fixtures; no permission diff in CI; no manifest snapshot.
- A test that asserts implementation instead of behavior; a skipped test
  without an owner and expiry.

## 3. Waived gates

If the diff deletes or weakens a lint, a test, a type, a permission review or
an accessibility check, flag the deletion itself, loudly — even when the new
code looks fine. Look for:

- A removed `eslint-disable` **or a new one without a description**; a
  `@ts-expect-error` that suppresses a real error; `@ts-ignore` or
  `@ts-nocheck`.
- A lint rule turned off in `eslint.config.mjs`, a layer wall removed, or a
  `no-restricted-imports` exception added for one file.
- A skipped test without an owner and expiry; a migration fixture deleted; a
  permission-register entry deleted while the permission stays.
- A `tsconfig` strictness flag turned off; `any` introduced at a boundary.
- A CSP relaxed, a host permission widened, or `eval` introduced "temporarily".

State the deletion, the reason it claims, and what it would take to keep the
gate. "Temporarily" is not a reason; an expiring waiver with an owner is.

## 4. How to review

1. **Read the change twice.** First for intent, then for the diff.
2. **Run the gates if you can:** `npx tsc --noEmit`, `npx eslint .`,
   `npx vitest run`, the build.
3. **Check the architecture and sender validation first.** They are the
   expensive findings; style is cheap.
4. **Cite evidence.** File and line for every Must fix; a rule name or a
   quoted contract for every finding.
5. **Propose the smallest fix.** "Rewrite the worker" is not a fix; "register
   the listener at top level and move the state read into the handler" is.
6. **Stop when the change is safe.** An empty Should-fix section is a valid
   review.

## 5. Worked example

`examples/review-extension.md` is a full review of a small MV3 extension: the
buggy worker and content script, the findings in ranking order, and the fixed
module. It shows the layer violation first, then sender validation, then the
worker-state bug, then the permission issue.

## 6. Cross-skill contract

- `extension-best-practices` defines the rules this review cites. When a
  finding and the skill disagree, the skill is the source.
- `extension-port` produces the change; this review checks it before release.
- The `lints/` config is the machine-checkable subset. A finding the config
  can catch should become a rule, not a repeated comment.
