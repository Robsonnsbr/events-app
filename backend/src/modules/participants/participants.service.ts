import { prisma } from "../../lib/prisma";

type CreateParticipantInput = {
  name: string;
  email: string;
  phone: string;
};

export async function listParticipants() {
  return prisma.participant.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createParticipant(input: CreateParticipantInput) {
  return prisma.participant.create({
    data: input,
  });
}
