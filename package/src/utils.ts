export const normalizedPath = (path: string | undefined) => {
  const nPath = path?.replace(/\/+$/, "").replace(/\/+/g, "/") // remove trailing slashes and double slashes
  return nPath || "/"
}
