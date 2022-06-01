import {createTestId} from './index';

const inputTestId = createTestId<{}>();

const emptyTestId = createTestId();

const userTestId = createTestId<{name: unknown; email: unknown}>();

const labelTestId = createTestId<{
  input: typeof inputTestId;
  text: unknown;
  user: typeof userTestId;
}>();

labelTestId.input = inputTestId;
labelTestId.user = userTestId;

export const text: string = labelTestId.text;

// @ts-expect-error
labelTestId.otherInput = inputTestId;

// @ts-expect-error
labelTestId.text = inputTestId;

// @ts-expect-error
labelTestId.otherText;

// @ts-expect-error
inputTestId.text;

// @ts-expect-error
emptyTestId.text;

createTestId('foo');

createTestId<{}>('foo');

// @ts-expect-error
createTestId({});

// @ts-expect-error
createTestId(3);

// @ts-expect-error
createTestId(undefined);

export const userName: string = labelTestId.user.name;

// @ts-expect-error
labelTestId.user.otherName;
