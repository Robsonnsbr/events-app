import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "./app-error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error.type === "entity.too.large") {
    res.status(413).json({ error: "Request payload is too large." });
    return;
  }

  if (error.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON in request body." });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ error: "A record with this value already exists." });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({ error: "The requested resource was not found." });
      return;
    }
  }

  res.status(500).json({ error: "Internal Server Error" });
};
