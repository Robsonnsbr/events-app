import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import {
  parseCreateEventInput,
  parseSubscribeParticipantInput,
} from "../../lib/validators";
import {
  createEvent,
  getEventById,
  listEvents,
  listParticipantsForEvent,
  subscribeParticipantToEvent,
} from "./events.service";

export const eventsRouter = Router();

eventsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const events = await listEvents();
    res.json(events);
  })
);

eventsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const event = await createEvent(parseCreateEventInput(req.body));
    res.status(201).json(event);
  })
);

eventsRouter.get(
  "/:eventId",
  asyncHandler(async (req, res) => {
    const { eventId } = req.params as { eventId: string };
    const event = await getEventById(eventId);
    res.json(event);
  })
);

eventsRouter.get(
  "/:eventId/participants",
  asyncHandler(async (req, res) => {
    const { eventId } = req.params as { eventId: string };
    const participants = await listParticipantsForEvent(eventId);
    res.json(participants);
  })
);

eventsRouter.post(
  "/:eventId/participants",
  asyncHandler(async (req, res) => {
    const { eventId } = req.params as { eventId: string };
    const { participantId } = parseSubscribeParticipantInput(req.body);
    const registration = await subscribeParticipantToEvent(eventId, participantId);

    res.status(201).json(registration);
  })
);
