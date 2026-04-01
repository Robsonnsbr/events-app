ALTER TABLE "Participant" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';

CREATE TABLE "EventParticipant" (
    "eventId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("eventId","participantId")
);

INSERT INTO "EventParticipant" ("eventId", "participantId")
SELECT "eventId", "id"
FROM "Participant";

ALTER TABLE "Participant" DROP CONSTRAINT "Participant_eventId_fkey";

ALTER TABLE "Participant" DROP COLUMN "eventId";

CREATE INDEX "EventParticipant_participantId_idx" ON "EventParticipant"("participantId");

ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
