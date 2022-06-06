import {createTestId, locator} from './index';
import {assert} from './index.spec';

import type {TestId} from './types';

console.log('Run tests for "locator"');

type Component = (props: Props) => object;
type Props = object;

const React = {
  createElement(ComponentOrTag: Component | string, props: Props, ...children: object[]) {
    props = {children, ...props};

    if (typeof ComponentOrTag === 'function') {
      return ComponentOrTag(props);
    }

    return {tag: ComponentOrTag, props};
  },
};

declare global {
  namespace JSX {
    export interface IntrinsicElements {
      div: {};
      h1: {};
      main: {};
      span: {};
    }
  }
}

type RootTestId = TestId<{
  leaf: unknown;
}>;

const rootTestId = createTestId<RootTestId>('root');

assert(
  JSON.stringify(locator(rootTestId)) === JSON.stringify({['data-testid']: 'root'}),
  'the locator correctly generates the data-testid attribute',
);

assert(
  JSON.stringify(locator(rootTestId.leaf)) === JSON.stringify({['data-testid']: 'root.leaf'}),
  'the locator correctly generates the data-testid attribute for leaves',
);

assert(
  JSON.stringify(locator(rootTestId, {property: 'foo'})) ===
    JSON.stringify({['data-testid']: 'root', ['data-test-property']: 'foo'}),
  'the locator correctly generates the data-test-* attributes',
);

type LabelTestId = TestId<{}>;

const Label = ({text}: {text: string}) => {
  const testId = createTestId<LabelTestId>();

  return <span {...locator(testId)}>{text}</span>;
};

type HeaderTestId = TestId<{
  foo: LabelTestId;
  bar: LabelTestId;
  baz: unknown;
}>;

const Header = () => {
  const testId = createTestId<HeaderTestId>();

  return (
    <h1 {...locator(testId)}>
      Header
      <Label text="foo" {...locator(testId.foo)} />
      <Label text="bar" {...locator(testId.bar)} />
    </h1>
  );
};

type MainTestId = TestId<{
  header: HeaderTestId;
  text: unknown;
}>;

const Main = () => {
  const testId = createTestId<MainTestId>();

  return (
    <main {...locator(testId)}>
      <Header {...locator(testId.header)} />
      Some main text
    </main>
  );
};

type AppTestId = TestId<{
  header: HeaderTestId;
  main: MainTestId;
  label: LabelTestId;
}>;

const App = () => {
  const testId = createTestId<AppTestId>('app');

  return (
    <div {...locator(testId)}>
      Hello👋 world!
      <Header {...locator(testId.header)} />
      <Main {...locator(testId.main)} />
      <Label text="baz" {...locator(testId.label)} />
    </div>
  );
};

const app = <App />;

const expectedApp = (
  <div data-testid="app">
    Hello👋 world!
    <h1 data-testid="app.header">
      Header
      <span data-testid="app.header.foo">foo</span>
      <span data-testid="app.header.bar">bar</span>
    </h1>
    <main data-testid="app.main">
      <h1 data-testid="app.main.header">
        Header
        <span data-testid="app.main.header.foo">foo</span>
        <span data-testid="app.main.header.bar">bar</span>
      </h1>
      Some main text
    </main>
    <span data-testid="app.label">baz</span>
  </div>
);

assert(
  JSON.stringify(app) === JSON.stringify(expectedApp),
  'testId should build correctly inside the react tree',
);
