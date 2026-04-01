const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(date: string) {
  return dateFormatter.format(new Date(date));
}
