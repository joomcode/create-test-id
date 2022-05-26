/**
 * Return true if types are exactly equal and false otherwise.
 * IsEqual<{foo: string}, {foo: string}> = true.
 * IsEqual<{readonly foo: string}, {foo: string}> = false.
 * @internal
 */
export type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

/**
 * Root TestId options.
 */
export type RootOptions = {eraseTestIdToEmptyString?: boolean; prefix: string};

/**
 * Generate TestId by shape.
 */
export type TestId<T> = {
  [K in keyof T]: IsEqual<T[K], unknown> extends true ? string : TestId<T[K]>;
};

/**
 * Creates testId as string from path in typed components tree.
 */
export type CreateTestId = (<T = {}>() => TestId<T>) &
  (<T = {}>(rootOptions: {eraseTestIdToEmptyString?: boolean; prefix: string}) => TestId<T>);

/**
 * Package exports.
 * @internal
 */
export type Exports = CreateTestId & {
  default?: CreateTestId;
  createTestId?: CreateTestId;
  __esModule?: true;
};
