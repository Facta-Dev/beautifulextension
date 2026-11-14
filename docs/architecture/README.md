# beautifulextension — Architecture Diagrams

Rendered with [Archify](https://github.com/tt-a1i/archify). Each entry is a standalone,
explorable HTML page (inline SVG, dark/light themes, live motion) paired with the source
JSON candidate it was rendered from. The set documents the Chrome Manifest V3 extension
architecture this repo teaches: the event-driven service worker as the only holder of the
session and the SDK, the typed RPC contract with sender validation and a message permission
table, the hexagonal layer walls (domain, application, adapters, ui, content, core) that
`lints/eslint.config.mjs` enforces, the `chrome.storage` areas and the `chrome.alarms` job
queue — with the three skills, the lint config and the CI gates as the delivery mechanism.

| Diagram | Type | What it shows | JSON | HTML |
|---|---|---|---|---|
| c4-containers | architecture | Container view of the extension runtime: the host page and the content script outside, the popup, side panel and options as thin clients, the service worker as the brain, the three chrome.storage areas as the only persistence and the product API it alone calls — plus the kit that ships the contract (three skills, the drop-in lint config, the violation harness, the CI jobs) | [json](c4-containers.json) | [html](c4-containers.html) |
| services-slices | architecture | The layer topology the architecture contract enforces — surfaces, contracts, adapters, application, domain, core and the worker-only SDK — with every dependency wall named and the lint rule that guards it, plus the ports each layer owns and the one-feature-one-slice rule | [json](services-slices.architecture.json) | [html](services-slices.architecture.html) |
| auth-algorithm | workflow | The trust algorithm as gated steps: a message arrives → classify the sender (id, then origin, then tab) → the message permission table → the handler parses the schema and calls one use case → the token is read from chrome.storage.session → the SDK call — with the managed-policy kill switch as a parallel gate | [json](auth-algorithm.workflow.json) | [html](auth-algorithm.workflow.html) |
| outbox-algorithm | workflow | The asynchronous delivery path: persist the job, one chrome.alarms tick drains the due jobs under a lock, the handler runs idempotently, the call is made with an idempotency key, and the outcome is acked, retried with backoff and jitter, or dead-lettered | [json](outbox-algorithm.workflow.json) | [html](outbox-algorithm.workflow.html) |
| auth-sequence | sequence | The message trace: a UI or content script sends a typed RPC, the worker applies the gate stack and answers FORBIDDEN for a message the sender may not send, then an allowed request reads the token and calls the API — the response carries data, never a token | [json](auth-sequence.sequence.json) | [html](auth-sequence.sequence.html) |
| outbox-sequence | sequence | The alarm drain trace: enqueue and commit, claim the due job, run the handler, call the API with an idempotency key, ack, and the two failure outcomes — a retryable error that backs off and is claimed again, and a terminal one that goes to the dead-letter store | [json](outbox-sequence.sequence.json) | [html](outbox-sequence.sequence.html) |
| database-dataflow | dataflow | Where the state goes: the surfaces send typed commands, the worker is the single writer of chrome.storage.local (settings, caches, job queue), chrome.storage.session (the access token) and chrome.storage.managed (read-only admin policy), and it alone makes the HTTPS call to the product API | [json](database-dataflow.dataflow.json) | [html](database-dataflow.dataflow.html) |
| runtime-lifecycle | lifecycle | The service worker runtime: start and register the listeners synchronously, idle until Chrome may terminate it, wake and rebuild the container from storage, handle the event as one use case, respond — with the rejection, enqueue, alarm-drain and settled branches | [json](runtime-lifecycle.lifecycle.json) | [html](runtime-lifecycle.lifecycle.html) |

The diagrams are conceptual and source-backed: every component, boundary and edge is traceable
to this repo's README, to the skills' references
(`skills/extension-best-practices/references/extension-architecture.md`,
`chrome-mv3.md`, `extension-patterns.md`) or to `lints/eslint.config.mjs` and the CI workflow —
not to a runtime this repository ships, because it ships none.

Three roles are **adapted** for this repo, and the file names stay stable only for series
consistency:

- **`auth-*` is the trust boundary, not a login.** This repo teaches an extension, which has
  no account system of its own: the authentication diagrams show the sender classification,
  the message permission table and the access token held in `chrome.storage.session`.
- **`outbox-*` is the job queue, not a transactional outbox.** There is no server, no outbox
  table and no worker process: the asynchronous path is the persisted job plus one
  `chrome.alarms` drain, with backoff, dead-lettering and idempotency.
- **`database-dataflow` is `chrome.storage` plus HTTPS.** There is no server-side database
  behind an extension; the store is the platform's and the system of record is the product API.

Authored with Archify, sibling set of the facta backend template.
