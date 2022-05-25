import type {CreateTestId, Exports} from './types';

export const createTestId: CreateTestId = () => {};

export default createTestId;

declare const module: {exports: Exports};

module.exports = createTestId;
module.exports.createTestId = createTestId;
module.exports.default = createTestId;
module.exports.__esModule = true;
