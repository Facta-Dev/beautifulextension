---
name: extension-port
description: >-
  Port an existing browser extension or web feature to a Manifest V3 Chrome
  extension with the same behavior: MV2 background pages, Firefox/Edge
  extensions, content-script hacks, or a web app that needs extension
  capabilities. Use this skill whenever the user asks to migrate, convert,
  rewrite, or port an extension to MV3, modernize a background page, replace
  a remote-code trick, or move logic into a service worker. Trigger on port,
  migrate, convert to MV3, "turn this MV2 extension into MV3", "move this to a
  service worker", or a pasted background page. Port the tests first, keep
  behavior identical, and write a PORTING.md.
---

# Extension port

A port preserves behavior while changing the platform. The output is not an
MV2 extension with a `service_worker` field; it is an MV3 extension that a
reviewer would have written, with the same observable behavior and tests
proving it.

## 1. The order of work

1. **Read the source and its tests.** The tests are the specification. If
   there are none, write characterization tests against the current behavior
   first.
2. **Port the tests first.** Same cases, same assertions, expressed in the
   target harness. A port without a failing test is a rewrite with hope.
3. **Map every platform API and every piece of state.** List the contexts,
   listeners, storage keys, messages, permissions, alarms and network calls.
4. **Define the target layers.** Domain/application/adapters/ui/content; the
   worker is the brain; the SDK moves into the worker.
5. **Port the behavior.** Small modules, one context at a time.
6. **Run the gates.** `tsc`, `eslint`, tests, a loaded build, a permission
   diff. Compare messages and storage, not just unit tests.
7. **Write `PORTING.md`.** Every deliberate difference, every MV2 trick not
   reproduced, every permission change, and why.

## 2. MV2 → MV3 mapping

| MV2 | MV3 |
|---|---|
| `background.persistent: true` / background page | Event-driven service worker; no DOM, no globals |
| `background.scripts` | `background.service_worker` (one module) |
| `chrome.runtime.onMessage` + `sendResponse` | Same API, but the worker may die; `return true` for async replies and wrap it in one transport adapter |
| Long-lived state in the background page | Typed storage + rebuild on wake; `storage.session` for ephemeral session state |
| `setInterval` heartbeat | `chrome.alarms` (minimum period applies; verify) |
| `webRequest` blocking | `declarativeNetRequest` (static rulesets reviewed like code) |
| `browser_action` / `page_action` | `action` |
| `chrome.extension.getBackgroundPage()` | Typed RPC to the worker |
| Remote code / `eval` / `new Function` | **Not allowed.** Move the logic into the bundle; remote config is data |
| `content_security_policy` string | Object form; keep `script-src 'self'; object-src 'self'` |
| `permissions` broad hosts | Narrow `host_permissions`, `activeTab`, optional permissions |
| `web_accessible_resources` globs | Specific assets + `matches`; dynamic URLs where supported (verify) |
| `externally_connectable` wildcard | Exact product origins only |
| `browser_specific_settings` (Firefox) | Keep through the build adapter; Chrome ignores it |

## 3. Web app → extension

When the source is a web app that needs extension capabilities:

- **Keep the web app's domain/SDK layer**, but move the SDK client into the
  service worker. The UI talks to the worker through the typed RPC.
- **Move tokens to `storage.session`** and never expose them to a content
  script or page. A web app's `localStorage` token is not an extension token.
- **Replace deep links** with `chrome.tabs.create`/`sidePanel.open` and a
  route table; replace `window.open` popups where the extension UI owns the
  flow.
- **Replace page scraping with content scripts** that send typed, validated
  data; keep selectors in remote config (data, not code) and version them.
- **Replace service-worker-shaped code** (a web app's `fetch` on load) with
  event-driven handlers and a job queue.
- **Permissions follow features.** Do not ship a web app's broad access as
  `<all_urls>`; use `activeTab` or optional hosts.

## 4. Firefox / Edge / cross-browser

- Build through the adapter (WXT or a manifest transform); keep one source
  tree and per-browser manifests.
- Firefox uses `browser.*` promises and `background.scripts`; Edge is
  Chromium and takes the Chrome build. Normalize the API surface in one
  adapter, not in feature code.
- A feature that Chrome supports and Firefox does not is an optional
  capability behind a port, not a branch in a use case.

## 5. Behavior parity checklist

- [ ] Every listener is registered at top level and survives a worker wake.
- [ ] Every piece of durable state is in typed storage and rebuilt on wake.
- [ ] Every message has the same sender validation and payload schema.
- [ ] Every permission has a register entry; the diff is reviewed.
- [ ] Every alarm/job is persisted, idempotent, and backoff-aware.
- [ ] Every storage migration has fixtures and is idempotent.
- [ ] Every UI surface works when the worker is asleep.
- [ ] Every token stays in the worker/session, never in a page.
- [ ] CSP has no `unsafe-*`; no remote code.
- [ ] The original tests pass, ported; new tests cover worker lifecycle,
      sender validation and migrations.
- [ ] `PORTING.md` lists every deliberate difference.

## 6. What not to do

- **Do not keep MV2's shape.** A background page's global object, a
  `setInterval`, or a blocking `webRequest` in MV3 is a port that will be
  rejected by the platform or the store.
- **Do not move the SDK into a content script** because it is convenient.
- **Do not widen a permission** to make a port compile; add the narrow
  optional permission and request it on a user gesture.
- **Do not skip the tests.** A port validated only by loading it once ships
  the source's bugs plus new ones.
- **Do not silently change behavior.** Reproduce the source quirk, pin it with
  a test, and list the fix as a follow-up — or fix it deliberately and say so.

## 7. Cross-skill contract

- `extension-best-practices` is the target style; every ported module follows
  it.
- `extension-review` reviews the port before release and ranks a broken
  architecture contract above every other finding.
- The `lints/` config is the machine-checkable half; a port that needs a lint
  exception is a port that has not finished.
