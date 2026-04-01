import express, { Request, Response } from "express";
import { env } from "./lib/env";
import { prisma } from "./lib/prisma";

const app = express();
app.use(express.json());

// ---------------------
// GET / => conta participantes
// ---------------------
app.get("/", async (req: Request, res: Response) => {
  try {
    const participantCount = await prisma.participant.count();
    res.json(
      participantCount === 0
        ? "No participants have been added yet."
        : `Some participants have been added to the database. Total: ${participantCount}`
    );
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------
// POST /events => cria um evento
// ---------------------
app.post("/events", async (req: Request, res: Response) => {
  try {
    const { title, description, date } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
      },
    });

    res.status(201).json(event);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------
// POST /participants => cria participante vinculado a um evento
// ---------------------
app.post("/participants", async (req: Request, res: Response) => {
  try {
    const { name, email, eventId } = req.body;

    const participant = await prisma.participant.create({
      data: {
        name,
        email,
        eventId,
      },
    });

    res.status(201).json(participant);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
