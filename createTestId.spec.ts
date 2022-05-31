import {createTestId, default as defaultCreateTestId} from './index';
import {assert} from './index.spec';

console.log(`Run custom tests for "${createTestId.name}"`);

assert(
  createTestId === defaultCreateTestId,
  'default createTestId is equals to createTestId for dev',
);

const appTestId = createTestId<{main: typeof articleTestId; footer: unknown}>('app');
const headerTestId = createTestId<{text: unknown}>();
const articleTestId = createTestId<{header: typeof headerTestId}>();

articleTestId.header = headerTestId;
appTestId.main = articleTestId;

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

assert(
  // @ts-expect-error: different testId have different types
  appTestId.footer !== appTestId.main,
  'different branches of testId tree contains different values',
);

assert(
  // @ts-expect-error: different testId have different types
  appTestId.main.header !== appTestId.main.header.text,
  'testId is not equals to its parent testId',
);

Object.defineProperty(appTestId.main, 'foo', {
  configurable: true,
  value: headerTestId,
  writable: true,
});

assert(
  // @ts-expect-error: property foo is not in testId types
  String(appTestId.main.foo) === 'app.main.foo',
  'configurable writable property gives correct testId string',
);
