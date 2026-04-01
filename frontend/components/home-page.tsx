"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { EventSummary } from "@/lib/types";

const initialForm = {
  title: "",
  description: "",
  date: "",
};

export function HomePage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadEvents() {
    try {
      setIsLoading(true);
      const response = await api.get<EventSummary[]>("/events");
      setEvents(response.data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Nao foi possivel carregar os eventos.")
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    setErrorMessage(null);

    try {
      await api.post("/events", {
        title: form.title,
        description: form.description,
        date: new Date(form.date).toISOString(),
      });

      setForm(initialForm);
      setFeedback("Evento criado com sucesso.");
      await loadEvents();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Nao foi possivel criar o evento.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
              <p className="mt-2 text-3xl font-semibold">{events.length}</p>
            </div>
            <div className="rounded-2xl bg-sky-100 px-5 py-4 text-slate-950">
              <p className="text-sm text-slate-600">Proximo evento</p>
              <p className="mt-2 text-lg font-semibold">
                {events[0] ? formatDate(events[0].date) : "Sem agenda"}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-100 px-5 py-4 text-slate-950">
              <p className="text-sm text-slate-600">Participantes</p>
              <p className="mt-2 text-lg font-semibold">
                {events.reduce((total, current) => total + current.participantCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
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
                required
                value={form.title}
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
                required
                type="datetime-local"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, date: event.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
              />
            </label>
          </div>

          {feedback ? (
            <p className="mt-4 rounded-2xl bg-emerald-400/15 px-4 py-3 text-sm text-emerald-200">
              {feedback}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-4 rounded-2xl bg-rose-400/15 px-4 py-3 text-sm text-rose-200">
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

        {isLoading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-[1.5rem] bg-slate-100"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
            Nenhum evento cadastrado ainda.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_24px_60px_-32px_rgba(14,116,144,0.45)]"
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
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-sm text-white">
                    {event.participantCount} inscritos
                  </span>
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
