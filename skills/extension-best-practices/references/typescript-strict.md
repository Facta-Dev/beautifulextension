# TypeScript strict for extensions

The tsconfig set and the type patterns that make extension code hard to
break. The point is not "more types"; it is that invalid states and unvalidated
boundaries fail to compile.

## 1. The strict set

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["chrome"],
    "skipLibCheck": true
  }
}
```

- `noUncheckedIndexedAccess` turns `frames[0]` into `Frame | undefined`; the
  compiler forces the check the handler needs anyway.
- `exactOptionalPropertyTypes` distinguishes an absent field from an explicit
  `undefined`; message payloads depend on the difference.
- `verbatimModuleSyntax` makes `import type` explicit; the bundler drops
  type-only imports without guessing.
- `types: ["chrome"]` brings the extension API types; keep the DOM lib for
  the UI and content contexts.

## 2. Discriminated unions

```ts
type LoadState<T> =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; data: T }
  | { status: "error"; error: { code: string; correlationId?: string } };
```

- A literal `status` (or `kind`) is the discriminant; narrow with `switch`.
- Every switch is exhaustive: `default: { const _never: never = state; }`
  or `satisfies never`. A new variant is a compile error.
- Never model one state with independent booleans; the impossible
  combinations still compile.

## 3. Branded ids

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };
type TabId = Brand<number, "TabId">;
type TenantId = Brand<string, "TenantId">;
```

A function that takes a `TenantId` cannot receive a raw string or a `TabId`.
Brand at the boundary (the message parser, the policy resolver), not in every
component.

## 4. Boundary types

- Parse every external value once: a message payload, a storage value, a
  policy document, an API response, a page-bridge message.
- `unknown` at the boundary, never `any`; narrow with a schema.
- A parsed value carries its schema version; a reader that does not know the
  version rejects it rather than guessing.
- A DTO is not a domain entity: map it in the adapter, not in a use case.

## 5. Result types

```ts
type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };
```

- Use cases return `Result` for expected failures (validation, permission,
  network); throw only for programmer errors.
- A cross-context response is a `Result`, never a thrown error; the transport
  adapter serializes it.
- Every error carries a stable `code` and a `correlationId`.

## 6. Async discipline

- `no-floating-promises` and `no-misused-promises` are errors: await,
  `void` with an internal catch, or return the promise.
- A listener that returns `true` must eventually call `sendResponse`; a
  timeout path returns a typed error.
- Retries are bounded and idempotent; a retry without an idempotency key is a
  duplicate mutation.

## 7. Type-level review questions

1. Could this state be a union instead of booleans?
2. Is every switch exhaustive?
3. Is this `as` justified and commented?
4. Is the id branded, or can a raw string stand in?
5. Is every external value parsed once, with a version?
6. Does the type survive `noUncheckedIndexedAccess`?
7. Does the error path return a `Result` instead of throwing across a
   context boundary?
