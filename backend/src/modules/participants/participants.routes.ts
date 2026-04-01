import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { parseCreateParticipantInput } from "../../lib/validators";
import { createParticipant, listParticipants } from "./participants.service";

export const participantsRouter = Router();

participantsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const participants = await listParticipants();
    res.json(participants);
  })
);

participantsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const participant = await createParticipant(parseCreateParticipantInput(req.body));
    res.status(201).json(participant);
  })
);
