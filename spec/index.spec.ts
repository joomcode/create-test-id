import {createTestId as createTestIdForDev, isTestId as isTestIdDev} from '../index';
import {
  createTestId as createTestIdForProduction,
  isTestId as isTestIdProduction,
} from '../production';

export function assert(value: unknown, message: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`Assert "${message}" fails`);
  }

  console.log('✓', message);
}

import './createTestId.spec';
import './production.spec';
import './locator.spec';

const runCommonTests = (
  createTestId: typeof createTestIdForDev,
  isTestId: typeof isTestIdDev,
  environment: 'dev' | 'production',
) => {
  console.log(`Run common tests for ${environment} createTestId and isTestId`);

  assert(typeof createTestId === 'function', 'createTestId imports as a function');

  const appTestId = createTestId<{main: typeof articleTestId; footer: unknown}>('app');
  const headerTestId = createTestId<{text: unknown}>();
  const articleTestId = createTestId<{header: typeof headerTestId}>();

  articleTestId.header = headerTestId;
  appTestId.main = articleTestId;

  assert(
    appTestId.main === articleTestId,
    'setting a property to testId creates a property with setting value',
  );

  assert('main' in appTestId, 'setted property passes an in-existence check');

  assert(
    appTestId.hasOwnProperty('main'),
    'setted property passes an hasOwnProperty-existence check',
  );

  // @ts-expect-error: properties of testId are not optional
  assert(delete appTestId.main, 'testId properties can be deleted');

  assert('main' in appTestId, 'property exists in testId after successful deletion');

  assert(
    Object.getOwnPropertyDescriptor(appTestId, 'main')?.value === appTestId.main,
    'getting a property descriptor on testId does not throw an exception',
  );

  assert(
    Object.getOwnPropertyDescriptor(appTestId, 'baz') === undefined,
    'getting a property descriptor of unexisting property on testId returns undefined',
  );

  assert(
    Object.getOwnPropertyNames(appTestId).includes('main'),
    'testId property is contained in the list of intrinsic properties of the parent testId',
  );

  try {
    Object.preventExtensions(appTestId.main);

    throw new Error();
  } catch (error) {
    assert(error instanceof TypeError, 'testId cannot be made non-extensible');
  }

  createTestId();

  const articleTestIdWithoutSettingParent = createTestId<{header: typeof headerTestId}>();

  assert(
    String(articleTestIdWithoutSettingParent) === '',
    'without setting a parent testId turns into an empty string',
  );

  assert(
    String(articleTestIdWithoutSettingParent.header) === '',
    'without setting a parent in chain testId turns into an empty string',
  );

  assert(
    appTestId.main.hasOwnProperty === Object.prototype.hasOwnProperty,
    'testId has correct inherited properties from object prototype',
  );

  assert(
    console.log(appTestId) === console.dir(appTestId.main),
    'console.log and console.dir do not cause loops on testId',
  );

  try {
    Object.defineProperty(appTestId.main, 'unwritable', {configurable: true});

    throw new Error();
  } catch (error) {
    assert(error instanceof TypeError, 'unwritable property cannot be defined on testId');
  }

  try {
    Object.defineProperty(appTestId.main, 'unconfigurable', {writable: true});

    throw new Error();
  } catch (error) {
    assert(error instanceof TypeError, 'unconfigurable property cannot be defined on testId');
  }

  try {
    Object.defineProperty(appTestId.main, 'get', {get() {}});

    throw new Error();
  } catch (error) {
    assert(error instanceof TypeError, 'getter cannot be defined on testId');
  }

  try {
    Object.defineProperty(appTestId.main, 'set', {set() {}});

    throw new Error();
  } catch (error) {
    assert(error instanceof TypeError, 'setter cannot be defined on testId');
  }

  Object.defineProperty(appTestId.main, 'foo', {
    configurable: true,
    value: headerTestId,
    writable: true,
  });

  assert('foo' in appTestId.main, 'configurable writable property can be defined on testId');

  Object.defineProperty(appTestId.main, 'quux', {configurable: true, value: {}, writable: true});

  assert(
    !('quux' in appTestId.main),
    'configurable writable property with non-testId value cannot be defined on testId',
  );

  // @ts-expect-error: properties of Object.prototype cannot be setted on testId
  appTestId.propertyIsEnumerable = articleTestId;

  assert(
    appTestId.propertyIsEnumerable === Object.prototype.propertyIsEnumerable,
    'properties of Object.prototype cannot be setted on testId',
  );

  // @ts-expect-error: no property toJSON on testId
  appTestId.toJSON = articleTestId;

  // @ts-expect-error: no property toJSON on testId
  assert(typeof appTestId.toJSON === 'function', 'property "toJSON" cannot be setted on testId');

  const symbol = Symbol();

  // @ts-expect-error: no symbol property on testId
  appTestId.main[symbol] = 3;

  assert(symbol in appTestId.main, 'symbol property can be defined on testId');

  // @ts-expect-error: no symbol property on testId
  assert(appTestId.main[symbol] === 3, 'symbol property is setted with origin value on testId');

  assert(isTestId(appTestId), 'isTestId works correctly for root testId');

  assert(isTestId(appTestId.main), 'isTestId works correctly for child testId');

  assert(isTestId(appTestId.main.toString) === false, 'isTestId works correctly in negative cases');

  assert(isTestId(Object) === false, 'isTestId works correctly for non-testId objects');

  assert(isTestId(null) === false, 'isTestId works correctly for null');

  assert(isTestId(undefined) === false, 'isTestId works correctly for undefined');
};

runCommonTests(createTestIdForDev, isTestIdDev, 'dev');
runCommonTests(createTestIdForProduction, isTestIdProduction, 'production');

console.log('[Ok] All tests passed!');
