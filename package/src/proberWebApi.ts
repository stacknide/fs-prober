import type { DataTransferDropEvent } from "./types"

const isDtMethodAvailable = (method: keyof DataTransferItem | (string & {})) => {
  if (typeof DataTransferItem === "undefined") return false
  return method in DataTransferItem.prototype
}
const shouldUseFsApi = isDtMethodAvailable("getAsFileSystemHandle")
const shouldUseWebkitApi = isDtMethodAvailable("webkitGetAsEntry")

const isFsApiHandle = (handle: FileSystemHandle | FileSystemEntry): handle is FileSystemHandle => {
  return "kind" in handle
}

export const isDirEntry = (
  handle: FileSystemEntry | FileSystemHandle,
): handle is FileSystemDirectoryHandle | FileSystemDirectoryEntry => {
  if ("kind" in handle) return handle.kind === "directory"
  if (handle.isDirectory) return true
  return false
}

export const isFileEntry = (
  handle: FileSystemEntry | FileSystemHandle,
): handle is FileSystemFileHandle | FileSystemFileEntry => {
  if ("kind" in handle) return handle.kind === "file"
  if (handle.isFile) return true
  return false
}

const errorOut = () => {
  const errMsg = "Your browser is not supported. Please use a chromium based browser."
  console.error(errMsg)
  return new Error(errMsg)
}

/** When we use FS API it will return promisified rootHandle else we'll get rootHandle directly */
export const getRootHandle = (dtEvent: DataTransferDropEvent, dataTransferItemIdx: number) => {
  if (!dtEvent.dataTransfer) throw new Error("Unable to get rootHandle for drop event")
  if (shouldUseWebkitApi) {
    const item = dtEvent.dataTransfer.items[dataTransferItemIdx]?.webkitGetAsEntry() // "DirectoryEntry" or "FileEntry"
    return item || null
  }
  if (shouldUseFsApi) {
    const handle = dtEvent.dataTransfer.items[dataTransferItemIdx]?.getAsFileSystemHandle()
    return handle || Promise.resolve(null)
    /**
     * We are returning a promise here. When the promise is resolved, we get a handle
     * The handle can be "FileSystemFileHandle" or "FileSystemDirectoryHandle"
     *
     * IMPORTANT: FileSystemDirectoryHandle or FileSystemFileHandle are experimental.
     * ref 1 : https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
     * ref 2: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle
     * The app needs to be served with secure contexts (HTTPS) using ngrok: https://frontendguruji.com/blog/run-next-js-app-locally-in-https/
     */
  }
  throw errorOut()
}

export const getHandleKind = (handle: FileSystemHandle | FileSystemEntry) => {
  if (shouldUseWebkitApi && !isFsApiHandle(handle)) {
    if ("isFile" in handle && handle.isFile) return "file"
    if ("isDirectory" in handle && handle.isDirectory) return "directory"
    throw new Error("Unknown handle kind")
  } else if (shouldUseFsApi) {
    if (isFsApiHandle(handle)) return handle.kind
    throw new Error("Invalid FileSystemHandle")
  }
  throw errorOut()
}

export const getDirHandleEntries = async (
  dirHandle: FileSystemDirectoryHandle | FileSystemDirectoryEntry,
) => {
  const errMsg = "Passed handle is not a directory"

  if (shouldUseWebkitApi && !isFsApiHandle(dirHandle)) {
    if (!dirHandle.isDirectory) throw Error(errMsg)

    const directoryReader = dirHandle.createReader()
    const readEntries = async () => {
      const allEntries: [FileSystemEntry["name"], FileSystemEntry][] = []

      const read = async (): Promise<[FileSystemEntry["name"], FileSystemEntry][]> => {
        return new Promise((resolve, reject) => {
          directoryReader.readEntries(
            (entriesArr) => {
              if (entriesArr.length > 0) {
                entriesArr.forEach((entry) => {
                  allEntries.push([entry.name, entry])
                })
                // Continue reading recursively
                read().then(resolve).catch(reject)
              } else {
                // Resolve with all entries when no more entries are available
                resolve(allEntries)
              }
            },
            (error) => reject(error),
          )
        })
      }

      return read()
    }

    return await readEntries()
  } else if (shouldUseFsApi && isFsApiHandle(dirHandle)) {
    if (dirHandle.kind !== "directory") throw Error(errMsg)

    const entries = []
    for await (const entry of dirHandle.entries()) {
      entries.push(entry) // entry = [name, handle]
    }

    return entries
  }
  throw errorOut()
}

export const getFile = async (fileHandle: FileSystemFileHandle | FileSystemFileEntry) => {
  if (shouldUseWebkitApi && !isFsApiHandle(fileHandle)) {
    const getFileFromFileEntry = async (fileEntry: FileSystemFileEntry): Promise<File> => {
      return new Promise((resolve, reject) => fileEntry.file(resolve, reject))
    }

    return await getFileFromFileEntry(fileHandle)
  } else if (shouldUseFsApi && isFsApiHandle(fileHandle)) {
    return await fileHandle.getFile()
  }
  throw errorOut()
}
