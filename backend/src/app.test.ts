import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    event: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    participant: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    eventParticipant: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("./lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { app } from "./app";

describe("Events App API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma.event.count.mockResolvedValue(2);
    mockPrisma.participant.count.mockResolvedValue(5);
    mockPrisma.event.findMany.mockResolvedValue([]);
    mockPrisma.event.create.mockResolvedValue({
      id: "event-1",
      title: "Tech Summit",
      description: "Evento de tecnologia",
      date: new Date("2030-01-10T10:00:00.000Z"),
      createdAt: new Date("2030-01-01T09:00:00.000Z"),
      _count: {
        registrations: 0,
      },
    });
    mockPrisma.participant.create.mockResolvedValue({
      id: "participant-1",
      name: "Ana",
      email: "ana@example.com",
      phone: "+55 11 99999-0000",
      createdAt: new Date("2030-01-01T09:00:00.000Z"),
    });
    mockPrisma.participant.findMany.mockResolvedValue([]);
    mockPrisma.event.findUnique.mockResolvedValue(null);
    mockPrisma.participant.findUnique.mockResolvedValue(null);
    mockPrisma.eventParticipant.findUnique.mockResolvedValue(null);
  });

  it("returns root metrics", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: "Events App API",
      status: "ok",
      metrics: {
        events: 2,
        participants: 5,
      },
    });
  });

  it("lists events with mapped participant count", async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      {
        id: "event-1",
        title: "Tech Summit",
        description: "Evento de tecnologia",
        date: new Date("2030-01-10T10:00:00.000Z"),
        createdAt: new Date("2030-01-01T09:00:00.000Z"),
        _count: {
          registrations: 3,
        },
      },
    ]);

    const response = await request(app).get("/events");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: "event-1",
      title: "Tech Summit",
      participantCount: 3,
    });
  });

  it("validates required fields when creating an event", async () => {
    const response = await request(app).post("/events").send({
      description: "Sem titulo",
      date: "2030-01-10T10:00:00.000Z",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "title must be a string.",
    });
  });

  it("creates a participant", async () => {
    const response = await request(app).post("/participants").send({
      name: "Ana",
      email: "ana@example.com",
      phone: "+55 11 99999-0000",
    });

    expect(response.status).toBe(201);
    expect(mockPrisma.participant.create).toHaveBeenCalledWith({
      data: {
        name: "Ana",
        email: "ana@example.com",
        phone: "+55 11 99999-0000",
      },
    });
    expect(response.body).toMatchObject({
      id: "participant-1",
      name: "Ana",
      email: "ana@example.com",
      phone: "+55 11 99999-0000",
    });
  });

  it("prevents duplicate event subscriptions", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "event-1",
    });
    mockPrisma.participant.findUnique.mockResolvedValue({
      id: "participant-1",
    });
    mockPrisma.eventParticipant.findUnique.mockResolvedValue({
      eventId: "event-1",
      participantId: "participant-1",
      createdAt: new Date("2030-01-01T09:00:00.000Z"),
      participant: {
        id: "participant-1",
        name: "Ana",
        email: "ana@example.com",
        phone: "+55 11 99999-0000",
      },
    });

    const response = await request(app)
      .post("/events/event-1/participants")
      .send({ participantId: "participant-1" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: "Participant is already subscribed to this event.",
    });
  });
});
