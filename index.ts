import type {CreateTestId, Exports, TestId, Target} from './types';

export type {TestId};

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

/**
 * TestId proxy set-trap handler.
 * @internal
 */
type Set = (target: Target, property: string | symbol, value: unknown, receiver: AnyTestId) => true;

function isTestId(value: unknown): value is AnyTestId {
  return (value as AnyTestId)?.[IS_TEST_ID] === true;
}

const set: Set = (target, property, value, receiver) => {
  if (typeof property === 'symbol') {
    target[property as unknown as string] = value;

    return true;
  }

  if (!(property in Object.prototype) && property !== 'toJSON' && isTestId(value)) {
    value[PARENT] = receiver;
    value[PROPERTY] = property;

    target[property] = value;
  }

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

/**
 * Create new testId (dev or production).
 * @internal
 */
type InternalCreateTestId = (parameters: {
  getTestIdInGetter: () => AnyTestId;
  prefix: string | undefined;
  set: Set;
  toString: () => string;
}) => AnyTestId;

const internalCreateTestId: InternalCreateTestId = ({getTestIdInGetter, prefix, set, toString}) => {
  const target: Target = {
    toJSON: toString,
    toString,
    valueOf: toString,
    [IS_TEST_ID]: true,
    [PREFIX]: prefix,
  };
  let testId: AnyTestId;

  const handler: ProxyHandler<Target> = {
    defineProperty(target, property, descriptor) {
      if (descriptor.configurable !== true || descriptor.writable !== true) {
        return false;
      }

      return set(target, property, descriptor.value, testId);
    },
    deleteProperty: () => true,
    get(target, property, receiver) {
      if (typeof property !== 'symbol' && !target[property]) {
        const testIdInGetter = getTestIdInGetter();

        testIdInGetter[PARENT] = receiver;
        testIdInGetter[PROPERTY] = property;

        target[property] = testIdInGetter;
      }

      return target[property as string];
    },
    preventExtensions: () => false,
    set,
  };

  testId = new Proxy(target, handler);

  return testId;
};

/**
 * Creates testId by typed shape.
 */
export const createTestId: CreateTestId = <T>(prefix?: string): TestId<T> =>
  internalCreateTestId({getTestIdInGetter: createTestId, prefix, set, toString}) as TestId<T>;

let productionTestId: AnyTestId | undefined;

/**
 * createTestid for production (does not create new objects and always returns an empty string).
 */
export const createTestIdForProduction: CreateTestId = <T>(): TestId<T> => {
  if (productionTestId === undefined) {
    productionTestId = internalCreateTestId({
      getTestIdInGetter: () => productionTestId as AnyTestId,
      prefix: undefined,
      set: (target, property, value, receiver) =>
        set(target, property, isTestId(value) ? productionTestId : undefined, receiver),
      toString: () => '',
    });
  }

  return productionTestId as TestId<T>;
};

export default createTestId;

declare const module: {exports: Exports};

module.exports = createTestId;
module.exports.createTestId = createTestId;
module.exports.createTestIdForProduction = createTestIdForProduction;
module.exports.default = createTestId;
Object.defineProperty(module.exports, '__esModule', {value: true});
