import type {CreateTestId, Exports, RootOptions, TestId, Target} from './types';

const IS_TEST_ID = Symbol();
const PARENT = Symbol();
const PROPERTY = Symbol();
const ROOT = Symbol();

/**
 * Any TestId.
 * @internal
 */
type AnyTestId = {
  [IS_TEST_ID]?: true;
  [PARENT]?: TestId<unknown>;
  [PROPERTY]?: string;
  [ROOT]?: RootOptions;
} & TestId<unknown>;

const get = (target: Target, property: string | symbol, receiver: AnyTestId) => {
  if (typeof property === 'symbol' || target[property]) {
    return target[property as string];
  }

  const testId = createTestId<AnyTestId>();

  testId[PARENT] = receiver;
  testId[PROPERTY] = property;

  target[property] = testId;

  return target[property];
};

const set = (target: Target, property: string | symbol, value: AnyTestId, receiver: AnyTestId) => {
  if (typeof property === 'symbol') {
    target[property as unknown as string] = value;

    return true;
  }

  if (property === 'toString' || value?.[IS_TEST_ID] !== true) {
    return true;
  }

  value[PARENT] = receiver;
  value[PROPERTY] = property;

  return true;
};

function toString(this: AnyTestId): string {
  const properties: string[] = [];
  let parent: AnyTestId | undefined;
  let testId = this;

  while ((parent = testId[PARENT])) {
    properties.unshift(testId[PROPERTY] as string);

    testId = parent;
  }

  const rootOptions = testId[ROOT];

  if (!rootOptions || rootOptions.setTestIdToEmptyString) {
    return '';
  }

  properties.unshift(rootOptions.prefix);

  return properties.join('.');
}

const proxyHandler = {get, set};

/**
 * Create testId by shape.
 */
export const createTestId: CreateTestId = <T>(rootOptions?: RootOptions): TestId<T> => {
  const target: Target = {toString, [IS_TEST_ID]: true};

  if (rootOptions) {
    target[ROOT] = rootOptions;
  }

  return new Proxy(target, proxyHandler) as TestId<T>;
};

export default createTestId;

declare const module: {exports: Exports};

module.exports = createTestId;
module.exports.createTestId = createTestId;
module.exports.default = createTestId;
module.exports.__esModule = true;
