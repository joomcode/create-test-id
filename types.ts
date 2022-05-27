/**
 * Return true if types are exactly equal and false otherwise.
 * IsEqual<{foo: string}, {foo: string}> = true.
 * IsEqual<{readonly foo: string}, {foo: string}> = false.
 */
export type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

/**
 * Generate TestId by shape.
 */
export type TestId<T> = {
  [K in keyof T]: IsEqual<T[K], unknown> extends true ? string : TestId<T[K]>;
};

/**
 * Creates testId as string from path in typed components tree.
 */
export type CreateTestId = (<T = {}>() => TestId<T>) & (<T = {}>(prefix: string) => TestId<T>);

/**
 * Package exports.
 * @internal
 */
export type Exports = CreateTestId & {
  default?: CreateTestId;
  createTestId?: CreateTestId;
  createTestIdForProduction?: CreateTestId;
  __esModule?: true;
};

/**
 * Proxy target.
 * @internal
 */
export type Target = Record<string | symbol, unknown>;
