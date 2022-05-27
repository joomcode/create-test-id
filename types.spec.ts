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
void labelTestId.otherText;

// @ts-expect-error
void inputTestId.text;

// @ts-expect-error
void emptyTestId.text;

void createTestId('foo');

void createTestId<{}>('foo');

// @ts-expect-error
void createTestId({});

// @ts-expect-error
void createTestId(3);

// @ts-expect-error
void createTestId(undefined);

export const userName: string = labelTestId.user.name;

// @ts-expect-error
void labelTestId.user.otherName;
