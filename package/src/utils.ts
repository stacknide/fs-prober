export const normalizedPath = (path: string | undefined): string => {
  const nPath = path?.replace(/\/+$/, "").replace(/\/+/g, "/") // remove trailing slashes and double slashes
  return nPath || "/"
}
