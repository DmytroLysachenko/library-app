import type appConfig from "@/lib/config";

type AppConfig = typeof appConfig;

type DeepPartial<T> = T extends Array<infer U>
  ? DeepPartial<U>[]
  : T extends Record<string, unknown>
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

const baseConfig: AppConfig = {
  env: {
    baseUrl: "http://localhost:3000",
    imagekit: {
      publicKey: "public-test-key",
      urlEndpoint: "https://cdn.test",
      privateKey: "private-test-key",
    },
    databaseUrl: "postgres://localhost:5432/library-test",
    upstash: {
      redisUrl: "https://upstash.redis.local",
      redisToken: "redis-token",
      qstashUrl: "https://upstash.qstash.local",
      qstashToken: "qstash-token",
    },
    email: {
      GMAIL_USER: "test@example.com",
      GMAIL_PASSWORD: "super-secret",
    },
    amazon: {
      accessKeyId: "aws-access-key",
      secretAccessKey: "aws-secret",
      region: "us-east-1",
      bucketName: "library-test-bucket",
    },
  },
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const deepMerge = <T>(target: T, source: DeepPartial<T>): T => {
  if (Array.isArray(target)) {
    const draft = [...target] as unknown[];
    const sourceValues = Array.isArray(source) ? source : [];

    sourceValues.forEach((value, index) => {
      if (value === undefined) return;

      const current = draft[index];

      if (isObject(value) && isObject(current)) {
        draft[index] = deepMerge(
          current,
          value as DeepPartial<typeof current>
        );
      } else {
        draft[index] = value as unknown;
      }
    });

    return draft as T;
  }

  if (!isObject(target) || !isObject(source)) {
    return (source ?? target) as T;
  }

  const draft: Record<PropertyKey, unknown> = {
    ...(target as Record<PropertyKey, unknown>),
  };

  for (const key of Object.keys(source) as Array<keyof typeof source>) {
    const value = source[key];
    if (value === undefined) continue;

    const current = draft[key as PropertyKey];

    if (isObject(value) && isObject(current)) {
      draft[key as PropertyKey] = deepMerge(
        current,
        value as DeepPartial<typeof current>
      );
    } else {
      draft[key as PropertyKey] = value as unknown;
    }
  }

  return draft as T;
};

export const createConfigMock = (overrides?: DeepPartial<AppConfig>): AppConfig => {
  if (!overrides) return clone(baseConfig);
  return deepMerge(clone(baseConfig), overrides);
};

const configMock = createConfigMock();

export default configMock;
