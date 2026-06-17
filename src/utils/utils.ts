export function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}
