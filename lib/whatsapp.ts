export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (/^55\d{10,11}$/.test(digits)) return digits;
  if (/^\d{10,11}$/.test(digits)) return `55${digits}`;
  return null;
}

export function formatPhone(raw: string) {
  const phone = normalizePhone(raw);
  if (!phone) return raw;
  const local = phone.slice(2);
  const area = local.slice(0, 2);
  const number = local.slice(2);
  const split = number.length - 4;
  return `(${area}) ${number.slice(0, split)}-${number.slice(split)}`;
}

export function whatsappLink(raw: string, text: string) {
  const phone = normalizePhone(raw);
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
