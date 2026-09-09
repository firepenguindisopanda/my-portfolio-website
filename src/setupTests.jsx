import '@testing-library/jest-dom/vitest';

const originalError = console.error;
const originalWarn = console.warn;
beforeAll(() => {
  console.error = (...args) => {
    const firstArg = typeof args[0] === 'string' ? args[0] : '';
    if (
      firstArg.includes('not wrapped in act') ||
      firstArg.includes('suspended resource finished loading') ||
      firstArg.includes('Not implemented: window.scrollTo') ||
      firstArg.includes('whileHover') ||
      firstArg.includes('whileTap') ||
      firstArg.includes('Consider adding an error boundary') ||
      firstArg.includes('does not recognize the') ||
      firstArg.includes('Error loading markdown') ||
      firstArg.includes('ReactDOMTestUtils.act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    const firstArg = typeof args[0] === 'string' ? args[0] : '';
    if (
      firstArg.includes('React Router Future Flag') ||
      firstArg.includes('Relative route resolution')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

HTMLElement.prototype.scrollIntoView = vi.fn();

const createMatchMedia = (matches = false) => (query) => ({
  matches,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: createMatchMedia(false),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;
window.ResizeObserver = ResizeObserverMock;

class IntersectionObserverMock {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.IntersectionObserver = IntersectionObserverMock;
window.IntersectionObserver = IntersectionObserverMock;

vi.mock('react-markdown', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
vi.mock('remark-gfm', () => ({ default: vi.fn() }));
vi.mock('react-syntax-highlighter', () => ({
  __esModule: true,
  Prism: ({ children }) => <pre>{children}</pre>,
  PrismLight: Object.assign(({ children }) => <pre>{children}</pre>, { registerLanguage: () => {} }),
}));
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({}));
