import type {CreateTestId, Exports, RootOptions, TestId} from './types';

/**
 * Create testId by shape.
 */
export const createTestId: CreateTestId = <T>(rootOptions?: RootOptions): TestId<T> => {
  void rootOptions;

  return {} as TestId<T>;
};

export default createTestId;

declare const module: {exports: Exports};

module.exports = createTestId;
module.exports.createTestId = createTestId;
module.exports.default = createTestId;
module.exports.__esModule = true;
