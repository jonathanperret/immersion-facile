import { Pool, PoolClient } from "pg";

export const withPgPoolClient = async <T>(
  pgPool: Pool,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pgPool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
};
