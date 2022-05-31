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

let lastGettedTestId: AnyTestId | undefined;
let previousLastGettedTestId: AnyTestId | undefined;

const toString = function (this: AnyTestId): string {
  const properties: string[] = [];
  let parent: AnyTestId | undefined;
  let testId = this;

  if (testId === lastGettedTestId) {
    lastGettedTestId = previousLastGettedTestId;
    previousLastGettedTestId = undefined;
  } else if (testId === previousLastGettedTestId) {
    previousLastGettedTestId = undefined;
  }

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
};

const deleteProperty = () => true;
const preventExtensions = () => false;

/**
 * Create new testId (dev or production).
 * @internal
 */
type InternalCreateTestId = (
  prefix?: string,
  getTestIdInGetter?: () => AnyTestId,
  internalSet?: Set,
  internalToString?: () => string,
) => AnyTestId;

const internalCreateTestId: InternalCreateTestId = (
  prefix,
  getTestIdInGetter = internalCreateTestId,
  internalSet = set,
  internalToString = toString,
) => {
  const target: Target = {
    toJSON: internalToString,
    toString: internalToString,
    valueOf: internalToString,
    [IS_TEST_ID]: true,
    [PREFIX]: prefix,
  };
  let testId: AnyTestId;

  const handler: ProxyHandler<Target> = {
    defineProperty(target, property, descriptor) {
      if (descriptor.configurable !== true || descriptor.writable !== true) {
        return false;
      }

      return internalSet(target, property, descriptor.value, testId);
    },
    deleteProperty,
    get(target, property, receiver) {
      if (typeof property === 'string' && !target[property]) {
        const testIdInGetter = getTestIdInGetter();

        testIdInGetter[PARENT] = receiver;
        testIdInGetter[PROPERTY] = property;

        target[property] = testIdInGetter;
      }

      const value = target[property as string];

      if (typeof property === 'string' && isTestId(value)) {
        if (value[PARENT] !== lastGettedTestId) {
          previousLastGettedTestId = lastGettedTestId;
        }

        lastGettedTestId = value;
      }

      return value;
    },
    preventExtensions,
    set: internalSet,
  };

  testId = new Proxy(target, handler);

  return testId;
};

/**
 * Creates testId by typed shape.
 */
export const createTestId: CreateTestId = <T>(prefix?: string): TestId<T> => {
  if (prefix === undefined && lastGettedTestId !== undefined) {
    const testId = lastGettedTestId as TestId<T>;

    lastGettedTestId = undefined;
    previousLastGettedTestId = undefined;

    return testId;
  }

  return internalCreateTestId(prefix) as TestId<T>;
};

let productionTestId: AnyTestId | undefined;

/**
 * createTestid for production (does not create new objects and always returns an empty string).
 */
export const createTestIdForProduction: CreateTestId = <T>(): TestId<T> => {
  if (productionTestId === undefined) {
    productionTestId = internalCreateTestId(
      undefined,
      () => productionTestId as AnyTestId,
      (target, property, value, receiver) =>
        set(target, property, isTestId(value) ? productionTestId : undefined, receiver),
      () => '',
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
Object.defineProperty(module.exports, '__esModule', {value: true});
