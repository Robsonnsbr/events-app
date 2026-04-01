import "dotenv/config";
import path from "path";

export default {
  schema: path.join(process.cwd(), "prisma/schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
};