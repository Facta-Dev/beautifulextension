# Extension architecture contract

The layer contract from the facta extension handbook, reduced to what an MV3
extension must keep. It is enforced by `lints/eslint.config.mjs`; this file
explains why each wall exists.

## 1. The layers

```text
ui (popup / side panel / options)  ──►  RPC client  ──►  service worker
content script                     ──►  RPC client  ──►  service worker
service worker:  adapters  ──►  application  ──►  domain
                 adapters: storage, messaging, SDK, alarms, identity, offscreen
```

| Layer | Responsibility | May import | Must not import |
|---|---|---|---|
| **domain** | Entities, rules, ports | nothing platform-specific | `chrome.*`, DOM, React, the SDK |
| **application** | Use cases, orchestration, policy resolver | domain, ports | `chrome.*`, DOM, React |
| **adapters** | Storage, messaging, SDK, alarms, identity, offscreen | application, domain, `chrome.*` | UI components |
| **ui** | Render, forward events, a11y | ViewModels, UI kit, the RPC client | the SDK, `chrome.*` directly, business rules |
| **content** | Read/augment the page | content RPC client, DOM | the SDK, tokens, session, business rules |
| **core** | Ports and pure types | nothing | everything else |

The walls are not style. A use case that imports `chrome.storage` cannot be
tested without a browser; a UI that imports the SDK holds a token a
compromised page can reach; a content script that writes policy is a
privilege-escalation path.

## 2. Ports

The consuming layer declares the port; the adapter implements it.

| Port | Declared by | Implemented by |
|---|---|---|
| `SessionStore` | application | `chrome.storage.session` adapter |
| `KeyValueStore<T>` | application | `chrome.storage.local` adapter |
| `PolicySource` | application | `chrome.storage.managed` adapter |
| `Clock` | domain/application | system clock (tests use a fake) |
| `JobQueue` | application | storage/IndexedDB adapter + alarms |
| `SdkClient` | application | the generated SDK, worker-only |
| `RpcTransport` | ui/content | `chrome.runtime` messaging adapter |
| `OffscreenParser` | application | offscreen document adapter |

A port belongs to the consumer. A use case that needs "the API" depends on a
`SdkClient` port, not on `@/sdk`; the composition root wires the real client
in the worker.

## 3. Composition roots

- **The worker** builds the container: storage, session, SDK, policy, queues.
  It is the only place that knows which adapter is live.
- **A UI surface** builds only its RPC client and ViewModel; it cannot build
  the SDK.
- **A content script** builds only its content RPC client and DOM adapters.
- Tests build the same container with fakes; the use case does not change.

## 4. Feature folders

One feature = one backend slice. The feature name is the same in:

- `src/features/<feature>/` (domain, application, adapters, ui, content);
- the route module `/api/v1/{userType}/<feature>/...`;
- the SDK module `sdk.{userType}.<feature>.<resource>`;
- the permission prefix `<feature>.<resource>.<action>`;
- the message types `<feature>.<action>` in the RPC contract.

A feature never imports another feature's internals; shared behavior moves to
`core` or a shared adapter.

## 5. The service worker

- Entry file: build the container cheaply, register every listener
  synchronously, then handle events.
- Each handler: parse the input, call a use case, persist the result, respond.
- Long work: enqueue a job; the alarm drains it within a budget.
- `onInstalled`: migrations, alarms, context menus, uninstall URL, onboarding.
- `onStartup`: reconcile queues, policy, session projections.
- `storage.onChanged` (managed): recompute policy, apply kill switches.
- No module-global durable state; a cache may exist but is rebuilt.

## 6. The policy resolver

Effective settings = `managed` > `user (local/sync)` > `defaults`.

- A pure `PolicyResolver` takes the three sources and returns the effective
  config plus the set of locked keys.
- UIs render a locked control read-only with a "managed by your organization"
  notice.
- A kill switch is a policy key; the worker applies it on change and the UI
  explains why.
- The managed schema (`storage.managed_schema`) and the resolver are one
  contract; a mismatch is a release blocker.

## 7. Messaging contract

- Every message type has: a schema, an allowed sender class, a handler, a
  valid fixture, an invalid fixture, and a sender-validation test.
- The message permission table is the authorization source; a type absent
  from the table is rejected.
- A content script's subset is deliberately small; a policy or session type
  is never in it.
- The RPC client handles disconnect/reconnect and surfaces a typed error.

## 8. Testing the layers

- **domain/application:** plain Vitest; no `chrome`, no DOM.
- **adapters:** contract tests against a fake `chrome` API (or a real one in
  an E2E run).
- **worker lifecycle:** wake, double-run idempotency, restart resume, alarm
  drain.
- **messaging:** valid/invalid fixtures, sender classes, unknown types.
- **storage:** migrations against fixtures of every released version.
- **E2E:** Playwright with the extension loaded for the critical journeys.
- **permissions:** a diff gate and a manifest snapshot per channel.

## 9. The enforcement map

| Rule | Where |
|---|---|
| domain/application do not touch `chrome.*` | `no-restricted-imports` for `src/domain/**`, `src/application/**` |
| UI does not call the SDK | `no-restricted-imports` for `src/ui/**`: `@/sdk` |
| content scripts do not get the SDK/session | `no-restricted-imports` for `src/content/**`: `@/sdk`, `@/session`, `@/auth` |
| SDK is React-free | `no-restricted-imports` for `src/sdk/**`: `react`, `chrome` |
| no remote code | `no-eval`, `no-new-func`, `no-implied-eval` |
| no silenced types | `@typescript-eslint/ban-ts-comment` |
| no unlimited disables | `@eslint-community/eslint-comments/*` |

When a change needs an exception, re-cut the layout; do not add a path to the
exception list. A config exception is a contract change.
