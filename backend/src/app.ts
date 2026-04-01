import cors from "cors";
import express from "express";
import { errorHandler } from "./lib/error-handler";
import { prisma } from "./lib/prisma";
import { eventsRouter } from "./modules/events/events.routes";
import { participantsRouter } from "./modules/participants/participants.routes";

export const app = express();

app.use(cors());
app.use(express.json());

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
