import type {CreateTestId, Exports, TestId, Target} from './types';

const IS_TEST_ID = Symbol('IS_TEST_ID');
const PARENT = Symbol('PARENT');
const PREFIX = Symbol('PREFIX');
const PROPERTY = Symbol('PROPERTY');

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

  target[property] = value;

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

const proxyHandler = {deleteProperty: () => true, get, preventExtensions: () => false, set};

/**
 * Creates testId by typed shape.
 */
export const createTestId: CreateTestId = <T>(prefix?: string): TestId<T> => {
  const target: Target = {toJSON: toString, toString, valueOf: toString, [IS_TEST_ID]: true};

  if (prefix !== undefined) {
    target[PREFIX] = prefix;
  }

  return new Proxy(target, proxyHandler) as TestId<T>;
};

let productionTestId: AnyTestId | undefined;

/**
 * createTestid for production (does not create new objects and always returns an empty string).
 */
export const createTestIdForProduction: CreateTestId = <T>(): TestId<T> => {
  if (productionTestId === undefined) {
    productionTestId = new Proxy(
      {toJSON: () => '', toString: () => '', valueOf: () => ''},
      {
        defineProperty(target, property, descriptor) {
          type Unused = typeof target | typeof property | true;

          return descriptor.configurable === true && descriptor.writable === (true as Unused);
        },
        deleteProperty: () => true,
        get(target: Target, property) {
          if (typeof property !== 'symbol' && !target[property]) {
            target[property] = productionTestId;
          }

          return target[property as string];
        },
        preventExtensions: () => false,
        set: () => true,
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
