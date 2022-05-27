import type {CreateTestId, Exports, TestId, Target} from './types';

const IS_TEST_ID = Symbol();
const PARENT = Symbol();
const PREFIX = Symbol();
const PROPERTY = Symbol();

/**
 * Any TestId.
 * @internal
 */
type AnyTestId = {
  [IS_TEST_ID]?: true;
  [PARENT]?: TestId<unknown>;
  [PREFIX]?: string;
  [PROPERTY]?: string;
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

  const prefix = testId[PREFIX];

  if (prefix === undefined) {
    return '';
  }

  properties.unshift(prefix);

  return properties.join('.');
}

const proxyHandler = {get, set};

/** Creates testId by typed shape. */
export const createTestId: CreateTestId = <T>(prefix?: string): TestId<T> => {
  const target: Target = {toJSON: toString, toString, [IS_TEST_ID]: true};

  if (prefix !== undefined) {
    target[PREFIX] = prefix;
  }

  return new Proxy(target, proxyHandler) as TestId<T>;
};

let productionTestId: AnyTestId | undefined;

/** createTestid for production (does not create new objects and always returns an empty string). */
export const createTestIdForProduction: CreateTestId = <T>(): TestId<T> => {
  if (productionTestId === undefined) {
    productionTestId = new Proxy(
      {
        toJSON() {
          return '';
        },
        toString() {
          return '';
        },
      },
      {
        get(target: Target, property: string | symbol) {
          if (typeof property === 'symbol' || target[property]) {
            return target[property as string];
          }

          return productionTestId;
        },
        set() {
          return true;
        },
      },
    );
  }

  return productionTestId as TestId<T>;
};

export default createTestId;

declare const module: {exports: Exports};

module.exports = createTestId;
module.exports.createTestId = createTestId;
module.exports.createTestIdForProduction = createTestIdForProduction;
module.exports.default = createTestId;
module.exports.__esModule = true;
