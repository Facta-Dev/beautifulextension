# Extension patterns

The patterns an MV3 extension needs, with the failure mode each prevents.

## 1. The typed RPC envelope

One protocol in `contracts/`, validated by both ends with the same schema.

```ts
export type SenderClass = "ui" | "content" | "external";

export type RpcRequest =
  | { v: 1; type: "session.get"; id: string; correlationId: string; payload: Record<string, never> }
  | { v: 1; type: "lead.capture"; id: string; correlationId: string; payload: { url: string; title: string } }
  | { v: 1; type: "settings.update"; id: string; correlationId: string; payload: { key: string; value: string } };

export type RpcError = { code: "UNAUTHENTICATED" | "FORBIDDEN" | "VALIDATION" | "CONFLICT" | "SERVER"; message: string; correlationId: string };
export type RpcResult<T> = { ok: true; data: T } | { ok: false; error: RpcError };
```

- `v` is the protocol version; unknown versions/types are rejected.
- `id` correlates the response; `correlationId` follows the request into logs
  and the API.
- Errors are values, never thrown across a context boundary.
- Additive changes stay within `v`; a breaking change bumps it and both ends
  ship together.

## 2. Sender validation

Every handler runs the same gate before parsing the payload:

```tsx
type Allowed = { ui: Set<RpcRequest["type"]>; content: Set<RpcRequest["type"]>; external: Set<RpcRequest["type"]> };

function classify(sender: chrome.runtime.MessageSender): SenderClass | null {
  if (sender.id !== chrome.runtime.id) return null;                 // another extension
  if (sender.tab) return sender.url?.startsWith("https://app.example.com/") ? "content" : null;
  if (sender.url?.startsWith(`chrome-extension://${chrome.runtime.id}/`)) return "ui";
  return null;
}
```

- Check `sender.id`, then origin/URL, then `frameId` for the message type,
  then the message permission table, then the payload schema and size.
- A content script may call only the small content subset; it never gets
  `session.*`, settings, or policy.
- `onMessageExternal` uses an exact origin allowlist, not a prefix guess.
- A rejected message returns a typed `FORBIDDEN`, never a silent `undefined`.

## 3. The service worker entry

```tsx
// Register every listener synchronously, before any await.
chrome.runtime.onInstalled.addListener((details) => { void onInstalled(details); });
chrome.runtime.onStartup.addListener(() => { void onStartup(); });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void handleMessage(message, sender).then(sendResponse);
  return true; // keep the channel open for the async response
});
chrome.alarms.onAlarm.addListener((alarm) => { void onAlarm(alarm); });
```

- The handler rebuilds its dependencies and reads storage on each wake.
- The listener body is short; long work is enqueued.
- `onInstalled` runs migrations and one-time setup; migrations also run lazily
  on first read.

## 4. The job queue and alarms

- Persist jobs: `{ id, type, payload, attempts, nextRunAt, idempotencyKey }`.
- One alarm drains due jobs within a time budget (e.g., 20 s) and re-arms.
- Exponential backoff with jitter; classify retryable (network, 429, 5xx)
  vs terminal; dead-letter store with admin-visible counts.
- One drain at a time via `navigator.locks.request("job-drain", …)`.
- Handlers are idempotent: the same job id runs once even if the worker dies
  mid-flight and the alarm fires again.

## 5. Typed storage and migrations

```ts
interface Store<T> {
  readonly key: string;
  readonly version: number;
  readonly schema: { parse(value: unknown): T };
  readonly fallback: T;
  read(): Promise<T>;
  write(value: T): Promise<void>;
}
```

- Namespaced keys (`<slice>:<name>`), a schema, a version, a default, size
  accounting.
- Single writer: the worker. Atomic read-modify-write under a lock.
- Migrations are pure `(vN) → (vN+1)` functions, idempotent, tested against
  fixtures of every released version; a backup key for one release.
- `minReaderVersion` prevents an older build from misreading a newer store.

## 6. The page bridge

- A main-world script and a content script communicate through
  `window.postMessage`.
- Validate `event.source === window`, `event.origin`, the message schema and
  a per-page nonce; never trust a page message just because it is on the
  right URL.
- The content script forwards only an allowlisted subset to the worker; the
  worker re-validates the sender.
- No token, no session, no policy change crosses the bridge.

## 7. The side panel and popup

- Both are Views: render state, send commands.
- Handle the worker being asleep: show a loading state, then the result.
- The side panel's per-tab/global mode is a product decision; document it and
  test the reopen path.
- Focus management: restore focus to the action button on close; trap focus
  in a modal within the panel.

## 8. Diagnostics and kill switch

- A diagnostics export collects: version, channel, effective policy, queue
  depth, dead-letter count, last errors with correlation IDs — no tokens, no
  page content.
- A policy kill switch disables a feature (or the whole extension) and the UI
  explains why; the worker applies it on `storage.onChanged`.
- Telemetry is opt-in, redacted, and documented in the privacy policy.
