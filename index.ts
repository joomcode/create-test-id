import type {CreateTestId, Locator, TestId, Target} from './types';

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

const internalIsTestId = isTestId as (value: unknown) => value is AnyTestId;

const set: ProxyHandler<Target>['set'] = (target, property, value, receiver) => {
  if (typeof property === 'symbol') {
    target[property as unknown as string] = value;

    return true;
  }

  if (!(property in Object.prototype) && property !== 'toJSON' && internalIsTestId(value)) {
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

const handler: ProxyHandler<Target> = {
  deleteProperty: () => true,
  get(target, property, receiver) {
    if (typeof property === 'string' && !target[property]) {
      const testIdInGetter = internalCreateTestId();

      testIdInGetter[PARENT] = receiver;
      testIdInGetter[PROPERTY] = property;

      target[property] = testIdInGetter;
    }

    const value = target[property as string];

    if (typeof property === 'string' && internalIsTestId(value)) {
      lastGettedTestId = value;
    }

    return value;
  },
  preventExtensions: () => false,
  set,
};

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

const internalCreateTestId = (prefix?: string) => {
  const target: Target = {
    toJSON: toString,
    toString,
    valueOf: toString,
    [PREFIX]: prefix,
  };

  target[TARGET as unknown as string] = target;

  const testId = new Proxy(target, {
    defineProperty(target, property, descriptor) {
      if (descriptor.configurable !== true || descriptor.writable !== true) {
        return false;
      }

      return set(target, property, descriptor.value, testId);
    },
    ...handler,
  }) as AnyTestId;

  return testId;
};

export const createTestId: CreateTestId = <T>(prefix?: string): TestId<T> => {
  if (prefix === undefined && lastGettedTestId !== undefined) {
    const testId = lastGettedTestId as TestId<T>;

    lastGettedTestId = undefined;

    return testId;
  }

  return internalCreateTestId(prefix) as TestId<T>;
};

export function isTestId(value: unknown): value is TestId<unknown> {
  return (value as AnyTestId)?.[TARGET] !== undefined;
}

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

export type {TestId};

export default createTestId;

declare const exports: object;
declare const module: {exports: CreateTestId};

module.exports = createTestId;
Object.assign(module.exports, exports);
Object.defineProperty(module.exports, '__esModule', {value: true});
