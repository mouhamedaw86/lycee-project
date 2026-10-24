export function downloadPdf(title: string, text: string) {
  window.dispatchEvent(new CustomEvent('print-doc', { detail: { title, text } }));
}
