/**
 * Creates testId as string from path in typed components tree.
 */
export type CreateTestId = () => void;

/**
 * Package exports.
 * @internal
 */
export type Exports = CreateTestId & {
  default?: CreateTestId;
  createTestId?: CreateTestId;
  __esModule?: true;
};
