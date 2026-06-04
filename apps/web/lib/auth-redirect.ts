export function getSafeNextPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return "/recipes";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/recipes";
  }

  return value;
}
