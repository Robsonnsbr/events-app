import { AppError } from "./app-error";

const MAX_LENGTHS: Record<string, number> = {
  title: 200,
  name: 150,
  email: 254,
  phone: 30,
  description: 2000,
  participantId: 36,
};

function maxLengthFor(fieldName: string): number {
  return MAX_LENGTHS[fieldName] ?? 500;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecord(value: unknown, message = "Invalid request body."): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new AppError(message, 400);
  }

  return value;
}

export function getRequiredString(
  value: unknown,
  fieldName: string,
  minimumLength = 1
): string {
  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string.`, 400);
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length < minimumLength) {
    throw new AppError(`${fieldName} is required.`, 400);
  }

  const max = maxLengthFor(fieldName);
  if (normalizedValue.length > max) {
    throw new AppError(`${fieldName} must be at most ${max} characters.`, 400);
  }

  return normalizedValue;
}

export function getOptionalString(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string.`, 400);
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const max = maxLengthFor(fieldName);
  if (normalizedValue.length > max) {
    throw new AppError(`${fieldName} must be at most ${max} characters.`, 400);
  }

  return normalizedValue;
}

export function getRequiredDate(value: unknown, fieldName: string): Date {
  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a valid ISO date string.`, 400);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(`${fieldName} must be a valid date.`, 400);
  }

  return parsedDate;
}

export function parseCreateEventInput(body: unknown) {
  const payload = getRecord(body);

  return {
    title: getRequiredString(payload.title, "title"),
    description: getOptionalString(payload.description, "description"),
    date: getRequiredDate(payload.date, "date"),
  };
}

export function parseCreateParticipantInput(body: unknown) {
  const payload = getRecord(body);

  return {
    name: getRequiredString(payload.name, "name"),
    email: getRequiredString(payload.email, "email"),
    phone: getRequiredString(payload.phone, "phone"),
  };
}

export function parseSubscribeParticipantInput(body: unknown) {
  const payload = getRecord(body);

  return {
    participantId: getRequiredString(payload.participantId, "participantId"),
  };
}
