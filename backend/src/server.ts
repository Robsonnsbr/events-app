import { app } from "./app";
import { env } from "./lib/env";
import { prisma } from "./lib/prisma";

const server = app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
