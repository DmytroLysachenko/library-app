export type RouterMock = {
  push: jest.Mock;
  replace: jest.Mock;
  prefetch: jest.Mock;
  back: jest.Mock;
  forward: jest.Mock;
  refresh: jest.Mock;
};

export const createRouterMock = (overrides: Partial<RouterMock> = {}): RouterMock => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  ...overrides,
});

const defaultRouter = createRouterMock();
let activeRouter: RouterMock = defaultRouter;

export const useRouter = jest.fn(() => activeRouter);
export const usePathname = jest.fn(() => "/");
export const useSearchParams = jest.fn(() => new URLSearchParams());
export const useParams = jest.fn(() => ({}));

export const setRouterMock = (nextRouter: RouterMock) => {
  activeRouter = nextRouter;
  useRouter.mockImplementation(() => activeRouter);
};

export const resetNavigationMocks = () => {
  Object.values(activeRouter).forEach((value) => {
    if (typeof value === "function" && "mockClear" in value) {
      (value as jest.Mock).mockClear();
    }
  });

  activeRouter = defaultRouter;
  useRouter.mockImplementation(() => activeRouter);
  usePathname.mockReturnValue("/");
  useSearchParams.mockImplementation(() => new URLSearchParams());
  useParams.mockImplementation(() => ({}));
};

export { activeRouter as routerMock };
