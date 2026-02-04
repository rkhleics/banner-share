export function normalizeUploadPath(input: string) {
  const cleaned = input.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\//, "");
  if (!cleaned) {
    return null;
  }
  const parts = cleaned.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    return null;
  }
  return cleaned;
}

export function isValidId(id: string) {
  return /^[a-zA-Z0-9_-]{6,32}$/.test(id);
}
