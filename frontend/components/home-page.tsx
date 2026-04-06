"use client";

import Link from "next/link";
import {
  FormEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { EventSummary } from "@/lib/types";

const initialForm = {
  title: "",
  description: "",
  date: "",
};

function validateEventForm(form: typeof initialForm): string | null {
  if (!form.title.trim()) {
    return "O nome do evento e obrigatorio.";
  }

  if (form.title.trim().length > 200) {
    return "O nome do evento deve ter no maximo 200 caracteres.";
  }

  if (form.description && form.description.trim().length > 2000) {
    return "A descricao deve ter no maximo 2000 caracteres.";
  }

  if (!form.date) {
    return "A data e hora do evento sao obrigatorias.";
  }

  const selectedDate = new Date(form.date);
  if (selectedDate.getTime() <= Date.now()) {
    return "A data do evento deve ser no futuro.";
  }

  return null;
}

export function HomePage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [form, setForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return events;
    }

    return events.filter((event) => {
      const haystack = `${event.title} ${event.description ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [deferredSearchTerm, events]);

  const upcomingEvent = useMemo(() => {
    const now = Date.now();
    return events.find((event) => new Date(event.date).getTime() >= now) ?? events[0];
  }, [events]);

  const currentDateTime = useMemo(() => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
  }, []);

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

  async function loadEvents(options?: { initial?: boolean }) {
    try {
      if (options?.initial) {
        setIsBootstrapping(true);
      } else {
        setIsLoading(true);
      }

      setLoadFailed(false);
      const response = await api.get<EventSummary[]>("/events");
      setEvents(response.data);
      setHasLoaded(true);
    } catch (error) {
      if (!hasLoaded) {
        setLoadFailed(true);
      }
      setErrorMessage(
        getApiErrorMessage(error, "Nao foi possivel carregar os eventos.")
      );
    } finally {
      setIsBootstrapping(false);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents({ initial: true });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    setFeedback(null);
    setErrorMessage(null);

    const error = validateEventForm(form);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<EventSummary>("/events", {
        title: form.title,
        description: form.description,
        date: new Date(form.date).toISOString(),
      });

      setForm(initialForm);
      setSearchTerm("");
      setCreatedEventId(response.data.id);
      setFeedback("Evento criado com sucesso. A agenda foi atualizada.");
      await loadEvents();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Nao foi possivel criar o evento.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEmptyState = hasLoaded && !events.length && !isBootstrapping;
  const noSearchResults = hasLoaded && !!events.length && !filteredEvents.length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-700">
            Events App
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Gerencie eventos e acompanhe participantes em uma unica interface.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Cadastre eventos, consulte detalhes e mantenha as inscricoes em dia
            com uma API em Node.js + Prisma e um frontend em Next.js.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-sm text-slate-300">Eventos</p>
              <p className="mt-2 text-3xl font-semibold">
                {isBootstrapping ? "..." : events.length}
              </p>
            </div>
            <div className="rounded-2xl bg-sky-100 px-5 py-4 text-slate-950">
              <p className="text-sm text-slate-600">Proximo evento</p>
              <p className="mt-2 text-lg font-semibold">
                {isBootstrapping
                  ? "Carregando..."
                  : upcomingEvent
                    ? formatDate(upcomingEvent.date)
                    : "Sem agenda"}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-100 px-5 py-4 text-slate-950">
              <p className="text-sm text-slate-600">Participantes</p>
              <p className="mt-2 text-lg font-semibold">
                {isBootstrapping
                  ? "..."
                  : events.reduce(
                      (total, current) => total + current.participantCount,
                      0
                    )}
              </p>
            </div>
          </div>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_90px_-40px_rgba(2,6,23,0.7)]"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
                Novo evento
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Criar evento</h2>
            </div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              POST /events
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Nome</span>
              <input
                value={form.title}
                maxLength={200}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                placeholder="Ex.: Semana de Tecnologia"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Descricao</span>
              <textarea
                value={form.description}
                maxLength={2000}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                placeholder="Contexto rapido do evento"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Data e hora</span>
              <input
                type="datetime-local"
                min={currentDateTime}
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, date: event.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
              />
              <span className="mt-2 block text-xs text-slate-400">
                Escolha uma data futura para manter a agenda consistente.
              </span>
            </label>
          </div>

          {validationError ? (
            <p
              aria-live="polite"
              className="mt-4 rounded-2xl bg-amber-400/15 px-4 py-3 text-sm text-amber-200"
            >
              {validationError}
            </p>
          ) : null}

          {feedback ? (
            <p
              aria-live="polite"
              className="mt-4 rounded-2xl bg-emerald-400/15 px-4 py-3 text-sm text-emerald-200"
            >
              {feedback}
            </p>
          ) : null}

          {errorMessage ? (
            <p
              aria-live="polite"
              className="mt-4 rounded-2xl bg-rose-400/15 px-4 py-3 text-sm text-rose-200"
            >
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Criar evento"}
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
              Agenda
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Eventos cadastrados
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Clique em um evento para gerenciar participantes.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block sm:max-w-md sm:flex-1">
            <span className="sr-only">Buscar eventos</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome ou descricao"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500"
            />
          </label>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-slate-500">Atualizando lista...</span>
            ) : (
              <span className="text-sm text-slate-500">
                {filteredEvents.length} evento(s) exibido(s)
              </span>
            )}
            <button
              type="button"
              onClick={() => void loadEvents()}
              disabled={isLoading}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Atualizar
            </button>
          </div>
        </div>

        {isBootstrapping ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-[1.5rem] bg-slate-100"
              />
            ))}
          </div>
        ) : loadFailed ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-rose-300 bg-rose-50 px-6 py-10 text-center">
            <p className="text-base font-medium text-rose-800">
              Nao foi possivel carregar os eventos.
            </p>
            <p className="mt-2 text-sm text-rose-600">
              Verifique sua conexao e tente novamente.
            </p>
            <button
              type="button"
              onClick={() => void loadEvents({ initial: true })}
              className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Tentar novamente
            </button>
          </div>
        ) : isEmptyState ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
            <p className="text-base font-medium text-slate-700">
              Nenhum evento cadastrado ainda.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Comece criando o primeiro evento no formulario ao lado.
            </p>
            <button
              type="button"
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Criar primeiro evento
            </button>
          </div>
        ) : noSearchResults ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
            Nenhum evento corresponde a busca atual.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className={`group rounded-[1.5rem] border bg-gradient-to-br from-white to-slate-50 p-6 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_24px_60px_-32px_rgba(14,116,144,0.45)] ${
                  createdEventId === event.id
                    ? "border-sky-300 shadow-[0_24px_60px_-32px_rgba(14,116,144,0.45)] ring-2 ring-sky-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                      Evento
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                      {event.title}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-sm text-white">
                      {event.participantCount} inscritos
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${
                        new Date(event.date).getTime() >= Date.now()
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {new Date(event.date).getTime() >= Date.now()
                        ? "Proximo"
                        : "Encerrado"}
                    </span>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
                  {event.description ?? "Sem descricao cadastrada."}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500">
                  <span>{formatDate(event.date)}</span>
                  <span className="font-medium text-sky-700 transition group-hover:text-sky-900">
                    Ver detalhes
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
