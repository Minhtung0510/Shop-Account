/** Build VietQR image URL (img.vietqr.io) — works without API key. */
export function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function buildVietQrImageUrl(params: {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
  template?: "compact" | "compact2" | "qr_only" | "print";
}): string {
  const {
    bin,
    accountNumber,
    accountName,
    amount,
    transferContent,
    template = "compact",
  } = params;

  const accountNameClean = removeVietnameseDiacritics(accountName)
    .toUpperCase()
    .slice(0, 50);
  const addInfo = transferContent.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || transferContent.slice(0, 50);

  const base = `https://img.vietqr.io/image/${bin}-${accountNumber}-${template}.jpg`;
  const qs = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo,
    accountName: accountNameClean,
  });

  return `${base}?${qs.toString()}`;
}

/** Unique payment memo for SePay / bank auto-match (prefix NAPTIEN). */
export function buildTopupTransferContent(topupId: string): string {
  const suffix = topupId.replace(/[^a-zA-Z0-9]/g, "").slice(-10).toUpperCase();
  return `NAPTIEN${suffix}`;
}

export function parseTopupCodeFromText(text: string): string | null {
  const match = text.toUpperCase().match(/NAPTIEN[A-Z0-9]{6,12}/);
  return match ? match[0] : null;
}
