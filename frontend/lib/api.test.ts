import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./api";

describe("getApiErrorMessage", () => {
  it("returns server error message from Axios response", () => {
    const error = new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: { error: "title is required." },
    });

    expect(getApiErrorMessage(error, "Fallback")).toBe("title is required.");
  });

  it("returns fallback when Axios response has no error field", () => {
    const error = new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 500,
      statusText: "Internal Server Error",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: {},
    });

    expect(getApiErrorMessage(error, "Something went wrong")).toBe(
      "Something went wrong"
    );
  });

  it("returns network error message when no response", () => {
    const error = new AxiosError("Network Error", "ERR_NETWORK");

    expect(getApiErrorMessage(error, "Fallback")).toBe(
      "Erro de conexao. Verifique sua internet e tente novamente."
    );
  });

  it("returns error.message for generic Error instances", () => {
    const error = new Error("Something broke");

    expect(getApiErrorMessage(error, "Fallback")).toBe("Something broke");
  });

  it("returns fallback for unknown error types", () => {
    expect(getApiErrorMessage("string error", "Fallback")).toBe("Fallback");
    expect(getApiErrorMessage(42, "Fallback")).toBe("Fallback");
    expect(getApiErrorMessage(null, "Fallback")).toBe("Fallback");
  });
});
