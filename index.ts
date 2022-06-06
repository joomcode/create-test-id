import type {CreateTestId, Locator, TestId, Target} from './types';

export type {TestId};

const PARENT = Symbol('PARENT');
const PREFIX = Symbol('PREFIX');
const PROPERTY = Symbol('PROPERTY');
const TARGET = Symbol('TARGET');

type AnyTestId = {
  [PARENT]?: AnyTestId;
  [PREFIX]?: string;
  [PROPERTY]?: string;
  [TARGET]: Target;
} & TestId<unknown>;

/**
 * TestId proxy set-trap handler.
 * @internal
 */
type Set = (target: Target, property: string | symbol, value: unknown, receiver: AnyTestId) => true;

export function isTestId(value: unknown): value is AnyTestId {
  return (value as AnyTestId)?.[TARGET] !== undefined;
}

const set: Set = (target, property, value, receiver) => {
  if (typeof property === 'symbol') {
    target[property as unknown as string] = value;

    return true;
  }

  if (!(property in Object.prototype) && property !== 'toJSON' && isTestId(value)) {
    const parent = value[PARENT];

    if (isTestId(parent)) {
      parent[TARGET][value[PROPERTY] as string] = undefined;
    }

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
    [PREFIX]: prefix,
  };

  target[TARGET as unknown as string] = target;

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

  testId = new Proxy(target, handler) as AnyTestId;

  return testId;
};

export const createTestId: CreateTestId = <T>(prefix?: string): TestId<T> => {
  if (prefix === undefined && lastGettedTestId !== undefined) {
    const testId = lastGettedTestId as TestId<T>;

    lastGettedTestId = previousLastGettedTestId;
    previousLastGettedTestId = undefined;

    return testId;
  }

  return internalCreateTestId(prefix) as TestId<T>;
};

export const locator: Locator = (testId, properties) => {
  const testIdString = String(testId);

  if (testIdString === '') {
    return;
  }

  const result: Record<string, string | undefined> = {'data-testid': testIdString};

  if (properties) {
    for (const key of Object.keys(properties)) {
      result[`data-test-${key}`] = properties[key];
    }
  }

  return result as ReturnType<Locator>;
};

export default createTestId;

declare const exports: object;
declare const module: {exports: CreateTestId};

module.exports = createTestId;
Object.assign(module.exports, exports);
Object.defineProperty(module.exports, '__esModule', {value: true});
