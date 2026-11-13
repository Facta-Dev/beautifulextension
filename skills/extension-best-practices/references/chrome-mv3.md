# Chrome MV3 digest

The platform facts an extension depends on, with the design consequence
spelled out. Chrome's documentation is the source; this is the review
checklist.

## 1. Execution contexts

| Context | DOM | Lifetime | Priviled APIs |
|---|---|---|---|
| Service worker | No | Event-driven; terminated when idle | Yes |
| Popup / side panel / options | Yes | While open | Via the worker |
| Content script | Page DOM (isolated world) | Page lifetime | Limited; no SDK |
| Main-world script | Page JS | Page lifetime | Page privileges |
| Offscreen document | Hidden DOM | Independent | Via the worker |

The worker is the only context that should hold the session and call the SDK.

## 2. Service worker lifetime

- Chrome terminates an idle worker after roughly 30 seconds without events or
  extension API calls; a single event handler can run for a few minutes at
  most; a fetch response wait is bounded (verify current limits).
- Consequences:
  - Register listeners **synchronously at top level**.
  - Do not keep durable state in globals.
  - Use `chrome.alarms` for periodic work; timers die with the worker.
  - Make every handler idempotent; an event can be delivered twice.
  - Resume long flows from persisted checkpoints, not from memory.
- A worker can be woken by a message, an alarm, a web navigation, a tab
  event, a command, or the action click. The first run after a wake has no
  in-memory state.

## 3. Storage areas

| Area | Scope | Encrypted at rest | Use |
|---|---|---|---|
| `storage.local` | Device | No | Settings, caches, non-secret state |
| `storage.session` | Worker + extension pages, memory | In memory | Access tokens, ephemeral session state |
| `storage.sync` | Chrome profile | Google account | Small preferences; quota-limited |
| `storage.managed` | Admin policy | Platform | Read-only enterprise policy |
| IndexedDB | Device | No | Larger structured data; not a secret store |

- Never put a token in `local`/`sync`/IndexedDB; `session` is the extension's
  ephemeral store.
- `storage.local` has a quota (verify; `unlimitedStorage` only when proven).
- `storage.onChanged` is the signal for policy and cross-context updates.
- Writes are asynchronous and can fail (quota, concurrent writers); handle the
  error and retry with a lock.

## 4. Manifest essentials

- `manifest_version: 3`; `name`/`description` via `__MSG_…__`; `default_locale`.
- `version` up to four dot-separated integers; `version_name` optional.
- `minimum_chrome_version` for the enterprise floor.
- `key` pins the extension ID; required for OAuth redirect URIs,
  `externally_connectable` and policy keyed by ID.
- `action`, `side_panel`, `options_ui`, `background.service_worker`,
  `content_scripts`, `permissions`, `host_permissions`,
  `optional_permissions`, `optional_host_permissions`,
  `web_accessible_resources`, `externally_connectable`,
  `content_security_policy`, `storage.managed_schema`, `incognito`.
- Generate it per channel from the build config; never edit the artifact.

## 5. Permissions

- Start with `storage`; add only what a feature uses.
- Prefer `optional_permissions` and `optional_host_permissions`, requested
  at runtime with a user gesture.
- `activeTab` grants temporary host access on a user gesture; prefer it over
  a broad static match.
- `scripting` + host access or `activeTab` for programmatic injection.
- `alarms` for scheduled work; `sidePanel` for the panel; `offscreen` for a
  hidden DOM; `identity` for OAuth; `notifications`, `downloads` optional.
- `declarativeNetRequest` for header/blocking rules; `webRequest` only for
  observation, and blocking is reserved for policy-installed extensions.
- Every permission and host has a register entry and a CI diff.

## 6. Content Security Policy

- Default extension pages: `script-src 'self'; object-src 'self'`.
- No `unsafe-eval`, no `unsafe-inline`, no remote script.
- `connect-src` can be narrowed to the API origin(s); verify it also
  constrains the worker in your Chrome versions.
- `base-uri 'none'` where applicable.
- WebAssembly needs `wasm-unsafe-eval` and a provenance review.

## 7. Messaging

- `chrome.runtime.sendMessage` for one-shot RPC; `chrome.runtime.connect` for
  a long-lived port (progress/streams).
- An async `onMessage` handler must `return true` to keep `sendResponse`
  alive; wrap this quirk in one transport adapter.
- `sender` carries `id`, `url`, `tab`, `frameId`, `documentId`. Validate all
  of them for the message class.
- `onMessageExternal` is for allowlisted web origins only;
  `externally_connectable` lists exact origins, never `*`.
- Ports disconnect when the worker dies; reconnect with backoff and resume
  from a cursor.

## 8. Identity and networking

- `chrome.identity.launchWebAuthFlow` runs the OAuth flow in a browser
  window; use PKCE and a redirect URI pinned to the extension ID
  (`https://<id>.chromiumapp.org/`).
- `chrome.identity.getAuthToken` is the Chrome-account path; it is a different
  consent model and not a substitute for enterprise SSO.
- A fetch from an extension page/worker to an origin needs the matching host
  permission (or CORS); a content script's fetch runs with the page's origin
  and CORS rules.
- No remote code: remote config is JSON validated by a schema; remote
  selectors/templates are data.

## 9. Alarms, offscreen, tabs

- `chrome.alarms` minimum period is version-dependent (verify); use one alarm
  to drain a queue within a time budget and re-arm.
- `chrome.offscreen.createDocument` needs a `reason`; one document at a time
  (verify); close it when done.
- `chrome.tabs`/`webNavigation` events are broad; filter by URL and frame and
  keep handlers cheap.
- `chrome.scripting.executeScript` on a user gesture is the narrow injection
  path; static content scripts are for sites the feature genuinely owns.

## 10. Store and enterprise

- The Web Store reviews permissions, remote code, and data use; a permission
  increase can require re-review.
- `storage.managed_schema` is the policy contract; `ExtensionSettings` is how
  admins force-install and pin.
- A kill switch is a policy key the worker reads and applies immediately.
