import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventDetailPage } from "./event-detail-page";

const { mockGet, mockPost, mockGetApiErrorMessage, mockUseParams } = vi.hoisted(
  () => ({
    mockGet: vi.fn(),
    mockPost: vi.fn(),
    mockGetApiErrorMessage: vi.fn(
      (_error: unknown, fallbackMessage: string) => fallbackMessage
    ),
    mockUseParams: vi.fn(),
  })
);

vi.mock("@/lib/api", () => ({
  api: {
    get: mockGet,
    post: mockPost,
  },
  getApiErrorMessage: mockGetApiErrorMessage,
}));

vi.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
}));

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ eventId: "event-1" });
  });

  it("loads event details and subscribes a participant", async () => {
    const eventPayload = {
      id: "event-1",
      title: "Tech Summit",
      description: "Evento de tecnologia",
      date: "2030-01-10T10:00:00.000Z",
      createdAt: "2030-01-01T09:00:00.000Z",
      participantCount: 0,
      participants: [],
    };

    const participantPayload = [
      {
        id: "participant-1",
        name: "Ana Souza",
        email: "ana@example.com",
        phone: "+55 11 99999-0000",
        createdAt: "2030-01-01T09:00:00.000Z",
      },
    ];

    mockGet
      .mockResolvedValueOnce({ data: eventPayload })
      .mockResolvedValueOnce({ data: participantPayload })
      .mockResolvedValueOnce({
        data: {
          ...eventPayload,
          participantCount: 1,
          participants: [
            {
              id: "participant-1",
              name: "Ana Souza",
              email: "ana@example.com",
              phone: "+55 11 99999-0000",
              subscribedAt: "2030-01-02T09:00:00.000Z",
            },
          ],
        },
      })
      .mockResolvedValueOnce({ data: participantPayload });

    mockPost.mockResolvedValueOnce({
      data: {
        eventId: "event-1",
        participantId: "participant-1",
      },
    });

    render(<EventDetailPage />);

    expect(await screen.findByText("Tech Summit")).toBeInTheDocument();
    expect(screen.getByText("Inscrever em evento")).toBeInTheDocument();

    fireEvent.submit(screen.getByRole("button", { name: "Inscrever participante" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/events/event-1/participants", {
        participantId: "participant-1",
      });
    });

    expect(await screen.findByText("Inscricao concluida com sucesso.")).toBeInTheDocument();
    expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
  });
});
