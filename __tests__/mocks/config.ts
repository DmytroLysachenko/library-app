import type appConfig from "@/lib/config";

type AppConfig = typeof appConfig;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K];
};

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
  const draft: any = Array.isArray(target)
    ? [...(target as unknown[])]
    : { ...(target as Record<PropertyKey, unknown>) };

  for (const key of Object.keys(source) as Array<keyof T>) {
    const value = source[key];
    if (value === undefined) continue;

    if (isObject(value) && isObject(draft[key])) {
      draft[key] = deepMerge(draft[key], value);
    } else {
      draft[key] = value as unknown;
    }
  }

  return draft;
};

export const createConfigMock = (overrides?: DeepPartial<AppConfig>): AppConfig => {
  if (!overrides) return clone(baseConfig);
  return deepMerge(clone(baseConfig), overrides);
};

const configMock = createConfigMock();

export default configMock;
