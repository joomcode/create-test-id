import type {CreateTestId, Locator, TestId, Target} from './types';

export type {TestId};

let testId: TestId<unknown> | undefined;

const set = (target: Target, property: string | symbol, value: unknown) => {
  if (
    typeof property === 'symbol' ||
    (!(property in Object.prototype) && property !== 'toJSON' && isTestId(value))
  ) {
    target[property as unknown as string] = value;
  }

  return true;
};

export const createTestId: CreateTestId = <T>(): TestId<T> => {
  if (testId === undefined) {
    const toString = () => '';

    testId = new Proxy(
      {toJSON: toString, toString, valueOf: toString},
      {
        defineProperty(target, property, descriptor) {
          if (descriptor.configurable !== true || descriptor.writable !== true) {
            return false;
          }

          return set(target, property, descriptor.value);
        },
        deleteProperty: () => true,
        get(target, property) {
          if (typeof property === 'string' && !target[property]) {
            target[property] = testId;
          }

          return target[property];
        },
        preventExtensions: () => false,
        set,
      },
    );
  }

  return testId as TestId<T>;
};

export function isTestId(value: unknown): value is TestId<unknown> {
  return value !== undefined && value === testId;
}

export const locator: Locator = () => undefined;

export default createTestId;

declare const exports: object;
declare const module: {exports: CreateTestId};

module.exports = createTestId;
Object.assign(module.exports, exports);
Object.defineProperty(module.exports, '__esModule', {value: true});
