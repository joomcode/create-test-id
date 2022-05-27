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

assert(
  String(appTestId.main.header.text) === 'app.main.header.text',
  'testId includes prefix and all intermediate properties',
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

const productionAppTestId = createTestIdForProduction<{main: typeof articleTestId}>('app');

productionAppTestId.main = articleTestId;

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

assert(
  // @ts-expect-error: different testId have different types
  productionAppTestId.main === productionAppTestId.main.header.text,
  'createTestIdForProduction returns one proxy object for all properties',
);

const articleTestIdWithoutSettingChild = createTestId<{header: typeof headerTestId}>();

assert(
  String(articleTestIdWithoutSettingChild) === '',
  'without setting a parent testId turns into an empty string',
);

assert(
  String(articleTestIdWithoutSettingChild.header) === '',
  'without setting a child testId all testId in this chain turn into an empty string',
);

console.log('[Ok] All tests passed!');
