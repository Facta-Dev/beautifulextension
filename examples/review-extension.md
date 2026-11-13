# A worked review: the capture extension

The subject is a small MV3 extension that captures a lead from a page. It
loads, it captures on the happy path, and it has five findings that a review
must rank in a useful order. The fixed version follows the contract in
`extension-best-practices`.

## The module under review

```tsx
// background.ts
let token: string | null = null;
let queue: Capture[] = [];
setInterval(() => { void flush(); }, 5_000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "capture") {
    queue.push(message.payload);
    sendResponse({ ok: true });
  }
  if (message.type === "session.get") {
    sendResponse({ token });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.local.get("token").then((value) => {
    token = value.token as string;
  });
});

async function flush(): Promise<void> {
  for (const item of queue) {
    await fetch("https://api.example.com/v1/leads", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(item),
    });
  }
  queue = [];
}
```

## The report

### Verdict

The extension works only while the worker stays alive, trusts every sender,
and gives a token to whoever asks. Not safe to ship; the sender validation is
the first fix because it is the one a content script exploits.

### Must fix

1. `background.ts:9` — `onMessage` does not check `sender.id`, origin,
   `frameId`, the message permission table, or the payload schema. Rule:
   *every message is authenticated by sender and parsed by a schema*. Fix:
   classify the sender, reject unknown classes, parse `capture` with its
   schema, and remove `session.get` from the content-script subset.
2. `background.ts:12` — a content script can request the session token.
   Rule: *the page never receives a token*. Fix: delete the `session.get`
   branch; the worker uses the token itself.
3. `background.ts:1` — the token and the queue live in module globals.
   Rule: *nothing important lives outside typed storage; the worker is
   mortal*. Fix: read the session from `storage.session` and the queue from
   its typed store on every wake.
4. `background.ts:3` — `setInterval` drives the flush. Rule: *durable work
   uses `chrome.alarms`*. Fix: register an alarm and drain the persisted queue
   in a bounded handler.
5. `background.ts:20` — `chrome.storage.local` holds the token. Rule: *tokens
   live in `storage.session`, never `local`*. Fix: migrate to
   `storage.session`; never log or message the token.

### Should fix

6. `background.ts:26` — the flush retries nothing and loses the queue on a
   failure. Fix: persist each job with an idempotency key, backoff, and a
   dead-letter store.
7. `manifest.json` — no evidence of a permission register or a narrow host
   list. Fix: add the register entry and limit `host_permissions` to
   `https://api.example.com/`.
8. `background.ts:9` — the listener returns `undefined` for async work.
   Fix: `return true` and respond from the promise, or use a typed transport
   adapter.

### Waived gates

None. The diff does not touch the lint config, the tests, or the manifest
permission review.

## The fixed module

```tsx
// background.ts — top-level listeners; state rebuilt from storage.
chrome.runtime.onMessage.addListener((raw, sender, sendResponse) => {
  void handleMessage(raw, sender).then(sendResponse);
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  void drainJobs(alarm);
});

chrome.runtime.onInstalled.addListener((details) => {
  void onInstalled(details);
});

async function handleMessage(
  raw: unknown,
  sender: chrome.runtime.MessageSender,
): Promise<RpcResult<unknown>> {
  const parsed = RpcRequestSchema.safeParse(raw);
  if (!parsed.success) return forbidden("VALIDATION");
  const senderClass = classify(sender);
  if (senderClass === null) return forbidden("FORBIDDEN");
  if (!allowed[senderClass].has(parsed.data.type)) return forbidden("FORBIDDEN");
  return runUseCase(parsed.data);
}
```

```tsx
// adapters/session.ts — the token never leaves the worker.
export async function readSession(): Promise<Session | null> {
  const value = await chrome.storage.session.get("session");
  return SessionSchema.nullable().parse(value.session);
}
```

```tsx
// application/capture.ts — a persisted job, idempotent and retryable.
export async function enqueueCapture(input: CaptureInput): Promise<void> {
  const job: Job = {
    id: crypto.randomUUID(),
    type: "capture",
    payload: input,
    attempts: 0,
    nextRunAt: Date.now(),
    idempotencyKey: input.id,
  };
  await jobs.write(job);
  await chrome.alarms.create("job-drain", { periodInMinutes: 1 });
}

export async function drainJobs(alarm: chrome.alarms.Alarm): Promise<void> {
  if (alarm.name !== "job-drain") return;
  await navigator.locks.request("job-drain", async () => {
    for (const job of await jobs.due(Date.now())) {
      await runJob(job); // idempotent, backoff on failure
    }
  });
}
```

## What changed, and why it matters

| Finding | The fixed version |
|---|---|
| Any sender can ask for the token | sender classification + message permission table |
| Token handed to a content script | `session.get` removed from the content subset |
| Globals die with the worker | state rebuilt from typed storage on wake |
| `setInterval` flush | `chrome.alarms` + persisted job queue |
| Token in `storage.local` | `storage.session`, worker-only |
| Fire-and-forget POST | idempotent job with backoff and dead-letter |

The review is short on purpose. Five Must-fix findings, each with a location,
a rule, and a fix, is a better review than twenty comments that repeat the
same contract in different words.
