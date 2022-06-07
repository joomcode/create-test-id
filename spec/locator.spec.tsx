import {createTestId, locator} from '../index';
import {assert} from './index.spec';

import type {TestId} from '../types';

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

const Label = ({level, text}: {level?: string; text: string}) => {
  const testId = createTestId<LabelTestId>();

  return <span {...locator(testId, {level})}>{text}</span>;
};

type HeaderTestId = TestId<{
  foo: LabelTestId;
  bar: LabelTestId;
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
  rendered: RenderedTestId;
  text: unknown;
}>;

const Main = ({render}: {render: Function}) => {
  const testId = createTestId<MainTestId>();

  testId.rendered;
  const rendered = render();

  return (
    <main {...locator(testId)}>
      <Header {...locator(testId.header)} />
      Some main text
      {rendered}
    </main>
  );
};

type AppTestId = TestId<{
  header: HeaderTestId;
  label: LabelTestId;
  main: MainTestId;
}>;

type RenderedTestId = TestId<{
  header: HeaderTestId;
}>;

const App = () => {
  const testId = createTestId<AppTestId>('app');

  const render = () => {
    const renderedTestId = createTestId<RenderedTestId>();

    return <Header {...locator(renderedTestId.header)} />;
  };

  return (
    <div {...locator(testId)}>
      Hello👋 world!
      <Header {...locator(testId.header)} />
      <Main render={render} {...locator(testId.main)} />
      <Label level="1" text="baz" {...locator(testId.label)} />
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
      <h1 data-testid="app.main.rendered.header">
        Header
        <span data-testid="app.main.rendered.header.foo">foo</span>
        <span data-testid="app.main.rendered.header.bar">bar</span>
      </h1>
    </main>
    <span data-testid="app.label" data-test-level="1">
      baz
    </span>
  </div>
);

assert(
  JSON.stringify(app) === JSON.stringify(expectedApp),
  'testId should build correctly inside the react tree',
);
