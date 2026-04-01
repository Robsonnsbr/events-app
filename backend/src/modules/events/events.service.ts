import { AppError } from "../../lib/app-error";
import { prisma } from "../../lib/prisma";

type CreateEventInput = {
  title: string;
  description: string | null;
  date: Date;
};

function mapEventSummary(event: {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  createdAt: Date;
  _count: { registrations: number };
}) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    createdAt: event.createdAt,
    participantCount: event._count.registrations,
  };
}

export async function listEvents() {
  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return events.map(mapEventSummary);
}

export async function getEventById(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          participant: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  if (!event) {
    throw new AppError("Event not found.", 404);
  }

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    createdAt: event.createdAt,
    participantCount: event._count.registrations,
    participants: event.registrations.map((registration) => ({
      id: registration.participant.id,
      name: registration.participant.name,
      email: registration.participant.email,
      phone: registration.participant.phone,
      subscribedAt: registration.createdAt,
    })),
  };
}

export async function createEvent(input: CreateEventInput) {
  const event = await prisma.event.create({
    data: input,
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  return mapEventSummary(event);
}

export async function listParticipantsForEvent(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          participant: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!event) {
    throw new AppError("Event not found.", 404);
  }

  return event.registrations.map((registration) => ({
    id: registration.participant.id,
    name: registration.participant.name,
    email: registration.participant.email,
    phone: registration.participant.phone,
    subscribedAt: registration.createdAt,
  }));
}

export async function subscribeParticipantToEvent(
  eventId: string,
  participantId: string
) {
  const [event, participant, existingRegistration] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.participant.findUnique({ where: { id: participantId } }),
    prisma.eventParticipant.findUnique({
      where: {
        eventId_participantId: {
          eventId,
          participantId,
        },
      },
      include: {
        participant: true,
      },
    }),
  ]);

  if (!event) {
    throw new AppError("Event not found.", 404);
  }

  if (!participant) {
    throw new AppError("Participant not found.", 404);
  }

  if (existingRegistration) {
    throw new AppError("Participant is already subscribed to this event.", 409);
  }

  const registration = await prisma.eventParticipant.create({
    data: {
      eventId,
      participantId,
    },
    include: {
      participant: true,
    },
  });

  return {
    eventId: registration.eventId,
    participantId: registration.participantId,
    createdAt: registration.createdAt,
    participant: {
      id: registration.participant.id,
      name: registration.participant.name,
      email: registration.participant.email,
      phone: registration.participant.phone,
    },
  };
}
