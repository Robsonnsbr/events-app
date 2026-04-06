import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./lib/error-handler";
import { requestLogger } from "./lib/request-logger";
import { prisma } from "./lib/prisma";
import { eventsRouter } from "./modules/events/events.routes";
import { participantsRouter } from "./modules/participants/participants.routes";

export const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  /^https?:\/\/localhost(:\d+)?$/,
  /\.replit\.dev(:\d+)?$/,
  /\.repl\.co(:\d+)?$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((pattern) => pattern.test(origin));
      callback(null, allowed);
    },
    credentials: true,
  })
);

app.use(requestLogger);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use(limiter);

app.use(express.json({ limit: "100kb" }));

app.get("/", async (_req, res) => {
  const [eventCount, participantCount] = await Promise.all([
    prisma.event.count(),
    prisma.participant.count(),
  ]);

  res.json({
    name: "Events App API",
    status: "ok",
    metrics: {
      events: eventCount,
      participants: participantCount,
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/events", eventsRouter);
app.use("/participants", participantsRouter);
app.use(errorHandler);
