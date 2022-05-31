import {createTestId as createTestIdForDev, createTestIdForProduction} from './index';

export function assert(value: unknown, message: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`Assert "${message}" fails`);
  }

  console.log('✓', message);
}

import './createTestId.spec';
import './createTestIdForProduction.spec';

const commonTests = (createTestId: typeof createTestIdForDev) => {
  console.log(`Run common tests for "${createTestId.name}"`);

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

  try {
    Object.preventExtensions(appTestId.main);

    throw new Error();
  } catch (error) {
    assert(error instanceof TypeError, 'testId cannot be made non-extensible');
  }

  const articleTestIdWithoutSettingChild = createTestId<{header: typeof headerTestId}>();

  assert(
    String(articleTestIdWithoutSettingChild) === '',
    'without setting a parent testId turns into an empty string',
  );

  assert(
    String(articleTestIdWithoutSettingChild.header) === '',
    'without setting a child testId all testId in this chain turn into an empty string',
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

  Object.defineProperty(appTestId.main, 'bar', {configurable: true, value: {}, writable: true});

  assert(
    !('bar' in appTestId.main),
    'configurable writable property with non-testId value cannot be defined on testId',
  );
};

commonTests(createTestIdForDev);
commonTests(createTestIdForProduction);

console.log('[Ok] All tests passed!');
