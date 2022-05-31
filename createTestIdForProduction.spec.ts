import {
  createTestId as createTestIdForDev,
  createTestIdForProduction as createTestId,
} from './index';
import {assert} from './index.spec';

console.log(`Run custom tests for "${createTestId.name}"`);

const appTestId = createTestId<{main: typeof articleTestId}>('app');
const headerTestId = createTestId<{text: unknown}>();
const articleTestId = createTestId<{header: typeof headerTestId}>();

const articleTestIdForDev = createTestIdForDev<{header: typeof headerTestId}>();

articleTestId.header = headerTestId;
articleTestIdForDev.header = headerTestId;

appTestId.main = articleTestIdForDev;

assert(
  appTestId.main !== articleTestIdForDev,
  'production testId does not really set dev testId in properties',
);

assert(
  appTestId.main.header.text.toString() === '',
  'createTestIdForProduction turns all testId into empty strings',
);

assert(
  JSON.stringify(appTestId.main.header) === '""',
  'casting production testID to JSON returns the empty string',
);

assert(`${appTestId.main}` === '', 'production testId is correct in template strings');

assert(
  appTestId.main.header.valueOf() === '',
  'production testId return correct string by valueOf()',
);

assert(
  // @ts-expect-error: different testId have different types
  appTestId.main === appTestId.main.header.text,
  'createTestIdForProduction returns one proxy object for all properties',
);

assert(
  Object.getOwnPropertyDescriptor(appTestId, 'main')?.value === appTestId,
  'getting a property descriptor on production testId does not throw an exception',
);

Object.defineProperty(appTestId.main, 'foo', {configurable: true, writable: true});

assert(
  // @ts-expect-error: property foo is not in testId types
  appTestId.main.foo === appTestId,
  'configurable writable property creates correct testId on production testId',
);

Object.defineProperty(appTestId.main, 'bar', {
  configurable: true,
  value: articleTestIdForDev,
  writable: true,
});

assert(
  'bar' in appTestId.main,
  'configurable writable property with dev testId as value creates testId on production testId',
);

assert(
  // @ts-expect-error: property foo is not in testId types
  appTestId.main.bar === appTestId,
  'configurable writable property creates production testId on production testId',
);
