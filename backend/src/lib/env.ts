import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

function getPort(): number {
  const rawPort = process.env.PORT ?? "3333";
  const port = Number.parseInt(rawPort, 10);

  if (Number.isNaN(port)) {
    throw new Error("PORT must be a valid number.");
  }

  return port;
}

export const env = {
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: getPort(),
};
