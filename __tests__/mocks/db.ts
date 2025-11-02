export type MockQueryBuilder<T> = Promise<T> & {
  from: jest.Mock<MockQueryBuilder<T>, [unknown?]>;
  where: jest.Mock<MockQueryBuilder<T>, [unknown?]>;
  limit: jest.Mock<MockQueryBuilder<T>, [unknown?]>;
  orderBy: jest.Mock<MockQueryBuilder<T>, [unknown?]>;
  leftJoin: jest.Mock<MockQueryBuilder<T>, [unknown?, unknown?]>;
  values: jest.Mock<MockQueryBuilder<T>, [unknown?]>;
  set: jest.Mock<MockQueryBuilder<T>, [unknown?]>;
  returning: jest.Mock<MockQueryBuilder<T>, [unknown?]>;
  execute: jest.Mock<Promise<T>, []>;
  onConflictDoNothing: jest.Mock<MockQueryBuilder<T>, [unknown?]>;
};

interface QueryBuilderOptions<T> {
  result: T;
  returningResult?: T;
}

export const createQueryBuilder = <T>({
  result,
  returningResult,
}: QueryBuilderOptions<T>): MockQueryBuilder<T> => {
  const promise = Promise.resolve(result) as MockQueryBuilder<T>;
  const nextReturnValue = returningResult ?? result;

  promise.from = jest.fn(() => promise);
  promise.where = jest.fn(() => promise);
  promise.limit = jest.fn(() => promise);
  promise.orderBy = jest.fn(() => promise);
  promise.leftJoin = jest.fn(() => promise);
  promise.values = jest.fn(() => promise);
  promise.set = jest.fn(() => promise);
  promise.onConflictDoNothing = jest.fn(() => promise);
  promise.execute = jest.fn(() => Promise.resolve(result));
  promise.returning = jest.fn(() =>
    createQueryBuilder({ result: nextReturnValue, returningResult: nextReturnValue })
  );

  return promise;
};

export interface DbMockOptions {
  selectResult?: unknown;
  insertResult?: unknown;
  insertReturningResult?: unknown;
  updateResult?: unknown;
  updateReturningResult?: unknown;
  deleteResult?: unknown;
}

export interface DbMock {
  select: jest.Mock<MockQueryBuilder<unknown>, [unknown?]>;
  insert: jest.Mock<MockQueryBuilder<unknown>, [unknown?]>;
  update: jest.Mock<MockQueryBuilder<unknown>, [unknown?]>;
  delete: jest.Mock<MockQueryBuilder<unknown>, [unknown?]>;
  transaction: jest.Mock<Promise<unknown>, [((tx: DbMock) => unknown | Promise<unknown>)?]>;
}

export const createDbMock = (options: DbMockOptions = {}): DbMock => {
  const {
    selectResult = [],
    insertResult = [],
    insertReturningResult,
    updateResult = [],
    updateReturningResult,
    deleteResult = [],
  } = options;

  const dbMock: DbMock = {
    select: jest.fn(() => createQueryBuilder({ result: selectResult })),
    insert: jest.fn(() =>
      createQueryBuilder({ result: insertResult, returningResult: insertReturningResult })
    ),
    update: jest.fn(() =>
      createQueryBuilder({ result: updateResult, returningResult: updateReturningResult })
    ),
    delete: jest.fn(() => createQueryBuilder({ result: deleteResult })),
    transaction: jest.fn(async (handler?: (tx: DbMock) => unknown | Promise<unknown>) => {
      if (!handler) return undefined;
      return handler(createDbMock(options));
    }),
  };

  return dbMock;
};

export const resetDbMock = (dbMock: DbMock) => {
  dbMock.select.mockClear();
  dbMock.insert.mockClear();
  dbMock.update.mockClear();
  dbMock.delete.mockClear();
  dbMock.transaction.mockClear();
};
