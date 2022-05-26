import {createTestId, default as defaultCreateTestId} from './index';

function assert(value: unknown, message: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`Assert "${message}" fails`);
  }

  console.log('✓', message);
}

assert(typeof createTestId === 'function', 'createTestId imports as a function');

assert(createTestId === defaultCreateTestId, 'default createTestId is equals to createTestId');

const headerTestId = createTestId<{text: unknown}>();

const articleTestId = createTestId<{header: typeof headerTestId}>();

articleTestId.header = headerTestId;

const appTestId = createTestId<{main: typeof articleTestId; footer: unknown}>({prefix: 'app'});

appTestId.main = articleTestId;

assert(
  String(appTestId.main.header.text) === 'app.main.header.text',
  'testId includes prefix and all intermediate properties',
);

assert(
  String(appTestId.main.header) === 'app.main.header',
  'testId is correct for intermediate properties',
);

assert(String(appTestId.main) === 'app.main', 'testId is correct for testId properties');

assert(String(appTestId) === 'app', 'root testId equals prefix');

assert(String(appTestId.footer) === 'app.footer', 'testId includes its own properties');

const productionAppTestId = createTestId<{main: typeof articleTestId}>({
  prefix: 'app',
  setTestIdToEmptyString: true,
});

productionAppTestId.main = articleTestId;

assert(
  productionAppTestId.main.header.text.toString() === '',
  'option setTestIdToEmptyString turns all testId into empty strings',
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
