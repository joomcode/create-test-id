import {createTestId, default as defaultCreateTestId} from './index';

function assert(value: unknown, message: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`Assert "${message}" fails`);
  }

  console.log('✓', message);
}

assert(typeof createTestId === 'function', 'createTestId imports as a function');
assert(typeof defaultCreateTestId === 'function', 'default createTestId imports as a function');

console.log('[Ok] All tests passed!');
