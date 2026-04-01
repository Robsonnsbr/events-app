import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./home-page";

const { mockGet, mockPost, mockGetApiErrorMessage } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockGetApiErrorMessage: vi.fn(
    (_error: unknown, fallbackMessage: string) => fallbackMessage
  ),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: mockGet,
    post: mockPost,
  },
  getApiErrorMessage: mockGetApiErrorMessage,
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and filters events", async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: "event-1",
          title: "Tech Summit",
          description: "Evento de tecnologia",
          date: "2030-01-10T10:00:00.000Z",
          createdAt: "2030-01-01T09:00:00.000Z",
          participantCount: 3,
        },
        {
          id: "event-2",
          title: "Design Week",
          description: "Evento de design",
          date: "2030-01-12T10:00:00.000Z",
          createdAt: "2030-01-02T09:00:00.000Z",
          participantCount: 1,
        },
      ],
    });

    render(<HomePage />);

    expect(await screen.findByText("Tech Summit")).toBeInTheDocument();
    expect(screen.getByText("Design Week")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Buscar por nome ou descricao"), {
      target: { value: "Design" },
    });

    await waitFor(() => {
      expect(screen.queryByText("Tech Summit")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Design Week")).toBeInTheDocument();
  });

  it("creates a new event and refreshes the list", async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            id: "event-3",
            title: "Open Source Day",
            description: "Comunidade e codigo",
            date: "2030-01-15T10:00:00.000Z",
            createdAt: "2030-01-02T10:00:00.000Z",
            participantCount: 0,
          },
        ],
      });

    mockPost.mockResolvedValueOnce({
      data: {
        id: "event-3",
        title: "Open Source Day",
      },
    });

    render(<HomePage />);

    await screen.findByText("Nenhum evento cadastrado ainda.");

    fireEvent.change(screen.getByPlaceholderText("Ex.: Semana de Tecnologia"), {
      target: { value: "Open Source Day" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contexto rapido do evento"), {
      target: { value: "Comunidade e codigo" },
    });
    const dateInput = document.querySelector(
      'input[type="datetime-local"]'
    ) as HTMLInputElement | null;

    expect(dateInput).not.toBeNull();

    fireEvent.change(dateInput!, {
      target: { value: "2030-01-15T10:00" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Criar evento" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/events", {
        title: "Open Source Day",
        description: "Comunidade e codigo",
        date: new Date("2030-01-15T10:00").toISOString(),
      });
    });

    expect(await screen.findByText("Evento criado com sucesso. A agenda foi atualizada.")).toBeInTheDocument();
    expect(await screen.findByText("Open Source Day")).toBeInTheDocument();
  });
});
