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

export function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantForm, setParticipantForm] = useState(participantFormInitialState);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingParticipant, setIsCreatingParticipant] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableParticipants = useMemo(() => {
    if (!event) {
      return participants;
    }

    const subscribedIds = new Set(event.participants.map((participant) => participant.id));
    return participants.filter((participant) => !subscribedIds.has(participant.id));
  }, [event, participants]);

  const loadPageData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

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
      setErrorMessage(
        getApiErrorMessage(error, "Nao foi possivel carregar os detalhes do evento.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    void loadPageData();
  }, [eventId, loadPageData]);

  useEffect(() => {
    if (!selectedParticipantId && availableParticipants[0]) {
      setSelectedParticipantId(availableParticipants[0].id);
    }

    if (
      selectedParticipantId &&
      availableParticipants.every((participant) => participant.id !== selectedParticipantId)
    ) {
      setSelectedParticipantId(availableParticipants[0]?.id ?? "");
    }
  }, [availableParticipants, selectedParticipantId]);

  async function handleCreateParticipant(eventObject: FormEvent<HTMLFormElement>) {
    eventObject.preventDefault();
    setIsCreatingParticipant(true);
    setFeedback(null);
    setErrorMessage(null);

    try {
      const response = await api.post<Participant>("/participants", participantForm);

      setParticipantForm(participantFormInitialState);
      setFeedback("Participante criado com sucesso.");
      await loadPageData();
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

      setFeedback("Participante inscrito com sucesso.");
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
      </section>

      {feedback ? (
        <p className="rounded-[1.5rem] bg-emerald-100 px-5 py-4 text-sm text-emerald-800">
          {feedback}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-[1.5rem] bg-rose-100 px-5 py-4 text-sm text-rose-800">
          {errorMessage}
        </p>
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
            className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.7)]"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
              Participante
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Cadastrar participante</h2>

            <div className="mt-6 space-y-4">
              <input
                required
                value={participantForm.name}
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
                required
                type="email"
                value={participantForm.email}
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
                required
                value={participantForm.phone}
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
                <span className="mb-2 block text-sm text-slate-600">Participante</span>
                <select
                  value={selectedParticipantId}
                  onChange={(eventObject) => setSelectedParticipantId(eventObject.target.value)}
                  disabled={availableParticipants.length === 0}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {availableParticipants.length === 0 ? (
                    <option>Nenhum participante disponivel</option>
                  ) : (
                    availableParticipants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name} - {participant.email}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubscribing || availableParticipants.length === 0}
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
