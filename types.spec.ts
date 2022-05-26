import {createTestId} from './index';

const inputTestId = createTestId<{}>();

const emptyTestId = createTestId();

const labelTestId = createTestId<{input: typeof inputTestId; text: unknown}>();

labelTestId.input = inputTestId;

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

void createTestId({prefix: 'foo'});

void createTestId({eraseTestIdToEmptyString: true, prefix: 'foo'});
void createTestId<{}>({eraseTestIdToEmptyString: false, prefix: 'foo'});

// @ts-expect-error
void createTestId({});

// @ts-expect-error
void createTestId({prefix: 3});

// @ts-expect-error
void createTestId({eraseTestIdToEmptyString: 'true', prefix: 'foo'});
