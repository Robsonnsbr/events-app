"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { EventDetail, Participant } from "@/lib/types";

const participantFormInitialState = {
  name: "",
  email: "",
  phone: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateParticipantForm(form: typeof participantFormInitialState): string | null {
  if (!form.name.trim()) {
    return "O nome do participante e obrigatorio.";
  }

  if (form.name.trim().length > 150) {
    return "O nome deve ter no maximo 150 caracteres.";
  }

  if (!form.email.trim()) {
    return "O email e obrigatorio.";
  }

  if (!EMAIL_REGEX.test(form.email.trim())) {
    return "Insira um email valido (ex.: nome@dominio.com).";
  }

  if (form.email.trim().length > 254) {
    return "O email deve ter no maximo 254 caracteres.";
  }

  if (!form.phone.trim()) {
    return "O telefone e obrigatorio.";
  }

  if (form.phone.trim().length > 30) {
    return "O telefone deve ter no maximo 30 caracteres.";
  }

  return null;
}

export function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantForm, setParticipantForm] = useState(participantFormInitialState);
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isCreatingParticipant, setIsCreatingParticipant] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const availableParticipants = useMemo(() => {
    if (!event) {
      return participants;
    }

    const subscribedIds = new Set(event.participants.map((participant) => participant.id));
    return participants.filter((participant) => !subscribedIds.has(participant.id));
  }, [event, participants]);

  const filteredAvailableParticipants = useMemo(() => {
    const normalizedSearch = participantSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return availableParticipants;
    }

    return availableParticipants.filter((participant) => {
      const haystack = `${participant.name} ${participant.email} ${participant.phone}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [availableParticipants, participantSearch]);

  useEffect(() => {
    if (!feedback && !errorMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
      setErrorMessage(null);
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorMessage, feedback]);

  const loadPageData = useCallback(async (options?: { showSkeleton?: boolean }) => {
    try {
      if (options?.showSkeleton) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setErrorMessage(null);
      setLoadFailed(false);

      const [eventResponse, participantsResponse] = await Promise.all([
        api.get<EventDetail>(`/events/${eventId}`),
        api.get<Participant[]>("/participants"),
      ]);

      setEvent(eventResponse.data);
      setParticipants(participantsResponse.data);
      setSelectedParticipantId((current) =>
        current && participantsResponse.data.some((participant) => participant.id === current)
          ? current
          : participantsResponse.data[0]?.id ?? ""
      );
    } catch (error) {
      setLoadFailed(true);
      setErrorMessage(
        getApiErrorMessage(error, "Nao foi possivel carregar os detalhes do evento.")
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    void loadPageData({ showSkeleton: true });
  }, [eventId, loadPageData]);

  useEffect(() => {
    if (!selectedParticipantId && filteredAvailableParticipants[0]) {
      setSelectedParticipantId(filteredAvailableParticipants[0].id);
    }

    if (
      selectedParticipantId &&
      filteredAvailableParticipants.every(
        (participant) => participant.id !== selectedParticipantId
      )
    ) {
      setSelectedParticipantId(filteredAvailableParticipants[0]?.id ?? "");
    }
  }, [filteredAvailableParticipants, selectedParticipantId]);

  async function handleCreateParticipant(eventObject: FormEvent<HTMLFormElement>) {
    eventObject.preventDefault();
    setValidationError(null);
    setFeedback(null);
    setErrorMessage(null);

    const error = validateParticipantForm(participantForm);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsCreatingParticipant(true);

    try {
      const response = await api.post<Participant>("/participants", participantForm);

      setParticipantForm(participantFormInitialState);
      setFeedback("Participante criado e selecionado para inscricao.");
      await loadPageData();
      setParticipantSearch("");
      setSelectedParticipantId(response.data.id);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Nao foi possivel criar o participante.")
      );
    } finally {
      setIsCreatingParticipant(false);
    }
  }

  async function handleSubscribeParticipant(eventObject: FormEvent<HTMLFormElement>) {
    eventObject.preventDefault();

    if (!selectedParticipantId) {
      setErrorMessage("Selecione um participante para inscrever.");
      return;
    }

    setIsSubscribing(true);
    setFeedback(null);
    setErrorMessage(null);

    try {
      await api.post(`/events/${eventId}/participants`, {
        participantId: selectedParticipantId,
      });

      setFeedback("Inscricao concluida com sucesso.");
      await loadPageData();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Nao foi possivel concluir a inscricao.")
      );
    } finally {
      setIsSubscribing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-14 w-44 animate-pulse rounded-full bg-slate-200" />
        <div className="h-72 animate-pulse rounded-[2rem] bg-white/80" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-[2rem] bg-white/80" />
          <div className="h-80 animate-pulse rounded-[2rem] bg-white/80" />
        </div>
      </div>
    );
  }

  if (loadFailed && !event) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Erro</p>
        <h1 className="text-4xl font-semibold text-slate-950">Falha ao carregar</h1>
        <p className="max-w-xl text-slate-600">
          Nao foi possivel carregar os detalhes do evento. Verifique sua conexao e tente novamente.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void loadPageData({ showSkeleton: true })}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Voltar para a agenda
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Evento</p>
        <h1 className="text-4xl font-semibold text-slate-950">Evento nao encontrado</h1>
        <p className="max-w-xl text-slate-600">
          O evento solicitado nao foi localizado ou houve um problema ao carregar os dados.
        </p>
        <Link
          href="/"
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Voltar para a agenda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-950"
      >
        Voltar para eventos
      </Link>

      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.5)] backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-700">
              Detalhes do evento
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              {event.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {event.description ?? "Sem descricao cadastrada para este evento."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
            <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-sm text-slate-300">Data</p>
              <p className="mt-2 text-lg font-semibold">{formatDate(event.date)}</p>
            </div>
            <div className="rounded-2xl bg-sky-100 px-5 py-4 text-slate-950">
              <p className="text-sm text-slate-600">Inscritos</p>
              <p className="mt-2 text-3xl font-semibold">{event.participantCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
          <span className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            Evento #{event.id.slice(0, 8)}
          </span>
          <button
            type="button"
            onClick={() => void loadPageData()}
            disabled={isRefreshing}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Atualizando..." : "Atualizar dados"}
          </button>
        </div>
      </section>

      {feedback ? (
        <p
          aria-live="polite"
          className="rounded-[1.5rem] bg-emerald-100 px-5 py-4 text-sm text-emerald-800"
        >
          {feedback}
        </p>
      ) : null}

      {errorMessage ? (
        <div
          aria-live="polite"
          className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-rose-100 px-5 py-4"
        >
          <p className="text-sm text-rose-800">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void loadPageData()}
            className="shrink-0 rounded-full border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-200"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                Participantes
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Lista de inscritos
              </h2>
            </div>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-sm text-white">
              {event.participants.length}
            </span>
          </div>

          {event.participants.length === 0 ? (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
              Ainda nao ha participantes inscritos neste evento.
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {event.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">
                        {participant.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{participant.email}</p>
                    </div>
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-sky-800">
                      {formatDate(participant.subscribedAt)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{participant.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <form
            onSubmit={handleCreateParticipant}
            noValidate
            className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.7)]"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
              Participante
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Cadastrar participante</h2>

            <div className="mt-6 space-y-4">
              <input
                value={participantForm.name}
                maxLength={150}
                onChange={(eventObject) =>
                  setParticipantForm((current) => ({
                    ...current,
                    name: eventObject.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                placeholder="Nome completo"
              />
              <input
                type="email"
                value={participantForm.email}
                maxLength={254}
                onChange={(eventObject) =>
                  setParticipantForm((current) => ({
                    ...current,
                    email: eventObject.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                placeholder="email@dominio.com"
              />
              <input
                value={participantForm.phone}
                maxLength={30}
                onChange={(eventObject) =>
                  setParticipantForm((current) => ({
                    ...current,
                    phone: eventObject.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                placeholder="Telefone para contato"
              />
            </div>

            {validationError ? (
              <p
                aria-live="polite"
                className="mt-4 rounded-2xl bg-amber-400/15 px-4 py-3 text-sm text-amber-200"
              >
                {validationError}
              </p>
            ) : null}

            <p className="mt-4 text-sm leading-6 text-slate-300">
              Depois de criar, o participante fica selecionado automaticamente
              para a inscricao no evento.
            </p>

            <button
              type="submit"
              disabled={isCreatingParticipant}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingParticipant ? "Salvando..." : "Criar participante"}
            </button>
          </form>

          <form
            onSubmit={handleSubscribeParticipant}
            className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.4)]"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
              Inscricao
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Inscrever em evento
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Escolha um participante ja cadastrado e vincule-o ao evento atual.
            </p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">
                  Buscar participante disponivel
                </span>
                <input
                  value={participantSearch}
                  onChange={(eventObject) => setParticipantSearch(eventObject.target.value)}
                  placeholder="Nome, email ou telefone"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Participante</span>
                <select
                  value={selectedParticipantId}
                  onChange={(eventObject) => setSelectedParticipantId(eventObject.target.value)}
                  disabled={filteredAvailableParticipants.length === 0}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {filteredAvailableParticipants.length === 0 ? (
                    <option>Nenhum participante disponivel</option>
                  ) : (
                    filteredAvailableParticipants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name} - {participant.email}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <p className="text-sm text-slate-500">
                {filteredAvailableParticipants.length === 0
                  ? "Todos os participantes disponiveis ja foram inscritos ou nao combinam com a busca."
                  : `${filteredAvailableParticipants.length} participante(s) pronto(s) para inscricao.`}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubscribing || filteredAvailableParticipants.length === 0}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubscribing ? "Inscrevendo..." : "Inscrever participante"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
