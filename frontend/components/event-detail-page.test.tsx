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

  it("shows error state with retry when initial load fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));
    mockGet.mockRejectedValueOnce(new Error("Network error"));
    mockGetApiErrorMessage.mockReturnValueOnce(
      "Nao foi possivel carregar os detalhes do evento."
    );

    render(<EventDetailPage />);

    expect(
      await screen.findByText("Falha ao carregar")
    ).toBeInTheDocument();
    expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
    expect(screen.getByText("Voltar para a agenda")).toBeInTheDocument();

    const eventPayload = {
      id: "event-1",
      title: "Tech Summit",
      description: "Evento de tecnologia",
      date: "2030-01-10T10:00:00.000Z",
      createdAt: "2030-01-01T09:00:00.000Z",
      participantCount: 0,
      participants: [],
    };

    mockGet
      .mockResolvedValueOnce({ data: eventPayload })
      .mockResolvedValueOnce({ data: [] });

    fireEvent.click(screen.getByText("Tentar novamente"));

    expect(await screen.findByText("Tech Summit")).toBeInTheDocument();
  });

  it("shows validation error for invalid email in participant form", async () => {
    const eventPayload = {
      id: "event-1",
      title: "Tech Summit",
      description: null,
      date: "2030-01-10T10:00:00.000Z",
      createdAt: "2030-01-01T09:00:00.000Z",
      participantCount: 0,
      participants: [],
    };

    mockGet
      .mockResolvedValueOnce({ data: eventPayload })
      .mockResolvedValueOnce({ data: [] });

    render(<EventDetailPage />);

    await screen.findByText("Tech Summit");

    fireEvent.change(screen.getByPlaceholderText("Nome completo"), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByPlaceholderText("email@dominio.com"), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone para contato"), {
      target: { value: "123456" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Criar participante" }));

    expect(
      await screen.findByText("Insira um email valido (ex.: nome@dominio.com).")
    ).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("shows validation error for missing participant name", async () => {
    const eventPayload = {
      id: "event-1",
      title: "Tech Summit",
      description: null,
      date: "2030-01-10T10:00:00.000Z",
      createdAt: "2030-01-01T09:00:00.000Z",
      participantCount: 0,
      participants: [],
    };

    mockGet
      .mockResolvedValueOnce({ data: eventPayload })
      .mockResolvedValueOnce({ data: [] });

    render(<EventDetailPage />);

    await screen.findByText("Tech Summit");

    fireEvent.submit(screen.getByRole("button", { name: "Criar participante" }));

    expect(
      await screen.findByText("O nome do participante e obrigatorio.")
    ).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("shows error banner when subscription fails", async () => {
    const eventPayload = {
      id: "event-1",
      title: "Tech Summit",
      description: null,
      date: "2030-01-10T10:00:00.000Z",
      createdAt: "2030-01-01T09:00:00.000Z",
      participantCount: 0,
      participants: [],
    };

    const participantPayload = [
      {
        id: "participant-1",
        name: "Ana",
        email: "ana@example.com",
        phone: "123",
        createdAt: "2030-01-01T09:00:00.000Z",
      },
    ];

    mockGet
      .mockResolvedValueOnce({ data: eventPayload })
      .mockResolvedValueOnce({ data: participantPayload });

    mockPost.mockRejectedValueOnce(new Error("Server error"));
    mockGetApiErrorMessage.mockReturnValueOnce(
      "Nao foi possivel concluir a inscricao."
    );

    render(<EventDetailPage />);

    await screen.findByText("Tech Summit");

    fireEvent.submit(screen.getByRole("button", { name: "Inscrever participante" }));

    expect(
      await screen.findByText("Nao foi possivel concluir a inscricao.")
    ).toBeInTheDocument();
  });
});
