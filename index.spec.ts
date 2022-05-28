import {createTestId, default as defaultCreateTestId, createTestIdForProduction} from './index';

function assert(value: unknown, message: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`Assert "${message}" fails`);
  }

  console.log('✓', message);
}

assert(typeof createTestId === 'function', 'createTestId imports as a function');

assert(
  typeof createTestIdForProduction === 'function',
  'createTestIdForProduction imports as a function',
);

assert(createTestId === defaultCreateTestId, 'default createTestId is equals to createTestId');

const headerTestId = createTestId<{text: unknown}>();

const articleTestId = createTestId<{header: typeof headerTestId}>();

articleTestId.header = headerTestId;

const appTestId = createTestId<{main: typeof articleTestId; footer: unknown}>('app');

appTestId.main = articleTestId;

assert('main' in appTestId, 'settin a property to testId actually creates a property');

// @ts-expect-error: properties of testId are not optional
assert(delete appTestId.main, 'testId properties can be deleted');

assert('main' in appTestId, 'property exists in testId after successful deletion');

try {
  Object.preventExtensions(appTestId.main);
  throw new Error();
} catch (error) {
  assert(error instanceof TypeError, 'testId cannot be made non-extensible');
}

assert(
  appTestId.main === articleTestId,
  'setting a property to testId creates a property with setting value',
);

assert(
  String(appTestId.main.header.text) === 'app.main.header.text',
  'testId includes prefix and all intermediate properties',
);

assert(
  appTestId.main.header.text.toString() === 'app.main.header.text',
  'testId return correct string by toString()',
);

assert(
  appTestId.main.header.text.valueOf() === 'app.main.header.text',
  'testId return correct string by valueOf()',
);

assert(
  JSON.stringify(appTestId.main.header.text) === '"app.main.header.text"',
  'casting testID to JSON returns the string with testId',
);

assert(
  String(appTestId.main.header) === 'app.main.header',
  'testId is correct for intermediate properties',
);

assert(String(appTestId.main) === 'app.main', 'testId is correct for testId properties');

assert(`${appTestId.main}` === 'app.main', 'testId is correct in template strings');

assert(String(appTestId) === 'app', 'root testId equals prefix');

assert(String(appTestId.footer) === 'app.footer', 'testId includes its own properties');

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

const productionAppTestId = createTestIdForProduction<{main: typeof articleTestId}>('app');

productionAppTestId.main = articleTestId;

assert(
  productionAppTestId.main !== articleTestId,
  'prototype testId does not set regular testId in properties',
);

assert(
  productionAppTestId.main.header.text.toString() === '',
  'createTestIdForProduction turns all testId into empty strings',
);

assert(
  console.log(productionAppTestId) === console.dir(productionAppTestId.main),
  'console.log and console.dir do not cause loops on production TestId',
);

assert(
  JSON.stringify(productionAppTestId.main.header) === '""',
  'casting production testID to JSON returns the empty string',
);

assert(`${productionAppTestId.main}` === '', 'production testId is correct in template strings');

assert(
  productionAppTestId.main.header.valueOf() === '',
  'production testId return correct string by valueOf()',
);

assert(
  // @ts-expect-error: different testId have different types
  productionAppTestId.main === productionAppTestId.main.header.text,
  'createTestIdForProduction returns one proxy object for all properties',
);

assert(
  'main' in productionAppTestId,
  'property existence check in production testId does not throw exception',
);

// @ts-expect-error: properties of testId are not optional
assert(delete productionAppTestId.main, 'production testId properties can be deleted');

assert(
  'main' in productionAppTestId,
  'property exists in production testId after successful deletion',
);

assert(
  Object.getOwnPropertyDescriptor(productionAppTestId, 'main')?.value === productionAppTestId,
  'getting a property descriptor on production testId does not throw an exception',
);

assert(
  productionAppTestId.hasOwnProperty === Object.prototype.hasOwnProperty,
  'production testId has correct inherited properties from object prototype',
);

try {
  Object.preventExtensions(productionAppTestId.main);
  throw new Error();
} catch (error) {
  assert(
    error instanceof TypeError,
    'testId from createTestIdForProduction cannot be made non-extensible',
  );
}

Object.defineProperty(productionAppTestId.main, 'foo', {configurable: true, writable: true});

assert(
  // @ts-expect-error: property foo is not in testId types
  productionAppTestId.main.foo === productionAppTestId,
  'configurable writable properties can be defined on production testId',
);

try {
  Object.defineProperty(productionAppTestId.main, 'unwritable', {configurable: true});
  throw new Error();
} catch (error) {
  assert(
    error instanceof TypeError,
    'unwritable properties cannot be defined on production testId',
  );
}

try {
  Object.defineProperty(productionAppTestId.main, 'unconfigurable', {writable: true});
  throw new Error();
} catch (error) {
  assert(
    error instanceof TypeError,
    'unconfigurable properties cannot be defined on production testId',
  );
}

try {
  Object.defineProperty(productionAppTestId.main, 'get', {get() {}});
  throw new Error();
} catch (error) {
  assert(error instanceof TypeError, 'getters cannot be defined on production testId');
}

try {
  Object.defineProperty(productionAppTestId.main, 'set', {set() {}});
  throw new Error();
} catch (error) {
  assert(error instanceof TypeError, 'setters cannot be defined on production testId');
}

console.log('[Ok] All tests passed!');
