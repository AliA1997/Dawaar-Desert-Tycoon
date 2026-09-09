// Orval emits two surfaces from the same OpenAPI operations and they collide on
// one name: `generated/api` exports a zod validator called `PollGameStateParams`
// and `generated/types` exports the DTO of the same name. Two bare `export *`s
// made that name ambiguous (TS2308), which failed `pnpm typecheck` for the whole
// monorepo — unnoticed because the only consumer imports a different symbol.
//
// An explicit re-export resolves the ambiguity, as the compiler itself suggests:
// the validator keeps the bare name (it is what call sites validate with), and
// the DTO stays reachable at `@workspace/api-zod/generated/types/pollGameStateParams`.
// Neither generated file is touched — regenerating from the spec is safe.
export * from "./generated/api";
export * from "./generated/types";
export { PollGameStateParams } from "./generated/api";
