import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Erro de conexao. Verifique sua internet e tente novamente.";
    }

    const serverMessage = (error.response.data as { error?: string })?.error;
    return serverMessage ?? fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
