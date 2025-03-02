import type { FileWithPath } from "react-dropzone"
import { getFile } from "./proberWebApi"
import { getNameId } from "./probers"
import {
  type FileNode,
  type FileNodeWithoutHandle,
  type FolderNode,
  type FolderNodeWithoutHandle,
  type HierarchyDetailsWithoutHandles,
  isFolderNode,
} from "./types"
import { normalizedPath as nP } from "./utils"

export const getFilesArrFromHierarchyFiles = async (
  hierarchyFiles: FileNode[] | undefined,
): Promise<File[] | null> => {
  if (!hierarchyFiles) return null
  const proberFilesData = []
  for (const file of hierarchyFiles) {
    const fileObj = await getFile(file.handle)
    Object.defineProperty(fileObj, "path", { value: file.path }) // This is the original path. path property becomes read-only here.
    proberFilesData.push(fileObj)
  }
  return proberFilesData
}

const isRootFile = (f: { path?: string; name: string }) => {
  try {
    if (!f.path) throw new Error("isRootFile: no path in file")
    const path = f.path.replace("/", "")
    const name = f.name.replace("/", "")
    return path === name
  } catch (e) {
    console.error(e)
    console.warn("isRootFile: ", f)
    throw e
  }
}

const generateFolders = (
  allFiles: FileNodeWithoutHandle[],
  nameMap: HierarchyDetailsWithoutHandles["nameMap"],
  objectMap: HierarchyDetailsWithoutHandles["objectMap"],
) => {
  const rootFolders: HierarchyDetailsWithoutHandles["rootFolders"] = []
  const allFolders: HierarchyDetailsWithoutHandles["allFolders"] = []
  const reservedFolderPaths: Map<string, string> = new Map() // {path: nameId}

  const createFoldersRecursively = (
    pathParts: string[],
    child: FileNodeWithoutHandle | FolderNodeWithoutHandle<FileNodeWithoutHandle>,
  ) => {
    if (!pathParts.length) return { pathIds: [] } // this is a root file

    const path = pathParts.join("/")
    if (reservedFolderPaths.has(path)) {
      const nameId = reservedFolderPaths.get(path)
      if (nameId) {
        const hierarchyDetailsNode = objectMap.get(nameId)
        if (child && hierarchyDetailsNode && isFolderNode(hierarchyDetailsNode)) {
          hierarchyDetailsNode.children.push(child)
        }
        return { pathIds: [nameId] }
      } else {
        throw new Error(`Unreachable code: nameId not found for path: ${path}`)
      }
    }

    const folderName = pathParts[pathParts.length - 1] || ""
    const nameId = getNameId(folderName, nameMap)
    const folder: FolderNodeWithoutHandle<FileNodeWithoutHandle> = {
      name: folderName,
      nameId,
      kind: "directory",
      isBranch: true,
      path,
      children: child ? [child] : [],
      pathIds: [],
    }

    objectMap.set(nameId, folder)
    allFolders.push(folder)
    reservedFolderPaths.set(path, nameId)

    if (pathParts.length > 1) {
      const nextPathParts = pathParts.slice(0, -1) // Remove the last part (processed folder name)
      const { pathIds } = createFoldersRecursively(nextPathParts, folder)

      folder.pathIds = [...pathIds, nameId]

      return { pathIds: folder.pathIds }
    } else {
      // This is a root folder
      rootFolders.push(folder)
      folder.pathIds = [nameId]
      return { pathIds: folder.pathIds }
    }
  }

  for (const file of allFiles) {
    if (isRootFile(file)) continue

    const path = nP(file.path)
    const pathParts = path.split("/").filter(Boolean).slice(0, -1)

    const { pathIds } = createFoldersRecursively(pathParts, file)

    file.pathIds = [...pathIds, file.nameId]
  }

  return [allFolders, rootFolders] as const
}

export const getHierarchyDetailsFromFiles = (
  filesArr: FileWithPath[],
): HierarchyDetailsWithoutHandles | null => {
  if (!filesArr) return null
  const nameMap: HierarchyDetailsWithoutHandles["nameMap"] = new Map()
  const objectMap: Map<string, FileNodeWithoutHandle | FolderNode> = new Map()

  const rootFiles: FileNodeWithoutHandle[] = []
  const allFiles = filesArr.map((f) => {
    const nameId = getNameId(f.name, nameMap)
    const path = nP(f.webkitRelativePath || f.path)
    const file: FileNodeWithoutHandle = {
      path,
      name: path.split("/").pop() || f.name,
      kind: "file",
      isBranch: false,
      pathIds: [nameId],
      nameId: nameId,
      // handle: undefined, // TODO: find a way to get FileEntry handle from File object (how to get a ev.dataTransfer from <Dropzone /> component?)
    }

    if (isRootFile(f)) rootFiles.push(file)

    objectMap.set(nameId, file)
    return file
  })

  const [allFolders, rootFolders] = //
    generateFolders(allFiles, nameMap, objectMap)

  const hierarchyDetails: HierarchyDetailsWithoutHandles = {
    emptyFolders: [],
    allFolders,
    rootFolders,
    allFiles,
    rootFiles,
    nameMap,
    objectMap,
    // rootHandles: [...rootFiles, ...rootFolders].map(() => null), // TODO
  }

  return hierarchyDetails
}

export const filterFiles = (itemsArray: (FileWithPath | DataTransferItem)[]): FileWithPath[] => {
  return itemsArray.filter((item): item is FileWithPath => {
    // Check if the item is a FileWithPath
    if (item instanceof File) {
      return true
    }

    // Check if the item is a DataTransferItem and contains a File
    if (item instanceof DataTransferItem && item.kind === "file") {
      const file = item.getAsFile()
      return file instanceof File
    }

    return false
  })
}

const isEmptyFolderAsFolderNode = (
  folderNode: FileWithPath | FolderNode,
): folderNode is FolderNode => {
  if (!("kind" in folderNode)) return false
  return folderNode.kind === "directory" && folderNode.children.length === 0
}

const isFile = (file: FileWithPath | FolderNode): file is FileWithPath => {
  return "path" in file
}

/** Converts an array of react-dropzone `File` objects and HierarchyDetails objects to a DataTransfer `FileList` */
export const convertToFileList = (fileArray: readonly FileWithPath[] | FolderNode[]): FileList => {
  const dataTransfer = new DataTransfer()
  fileArray.forEach((file) => {
    let newDtFile: File = new File([], file.name)
    if (!(file instanceof File) && isEmptyFolderAsFolderNode(file)) {
      // TODO: Is this block even needed??
      // If the object is not a File instance, then it must be an "empty directory" object from hierarchyDetails.emptyFolders. So create one
      const newFile = new File([], file.name)
      // Copy additional properties from the original object to the new File instance
      for (const key in file) {
        // @ts-ignore
        const shouldCopyProperty = file[key] && !newFile[key]
        if (shouldCopyProperty && key !== "name") {
          // @ts-ignore
          newFile[key] = file[key]
        }
      }
      newDtFile = newFile
    }

    // Check if the 'path' property exists and then set it to webkitRelativePath if its empty
    if (isFile(file) && file.path !== "" && file.webkitRelativePath === "") {
      const value = getWebkitRelativePath(file.path)
      const newFile = updateWebkitRelativePath(file, value)
      newDtFile = newFile
    }

    dataTransfer.items.add(newDtFile)
  })
  const fileListObj = dataTransfer.files
  return fileListObj
}

const getWebkitRelativePath = (str?: string) => {
  if (!str) return ""
  const path = str.startsWith("/") ? str.substring(1) : str // Remove leading slash
  const isFile = !path.includes("/")
  return isFile ? "" : path
}

/** Returns the original file path which is derived from `path` and `file.name` */
export const getOriginalFilePath = (file: File, path: string): string => {
  const pathParts = path.split("/").filter(Boolean) // /a/b/cd (1).mp4 => ['a', 'b', 'cd (1).mp4']
  // replace the last pathPart with the original file name
  pathParts[pathParts.length - 1] = file.name
  return pathParts.join("/")
}

export const updateWebkitRelativePath = (file: FileWithPath, path: string): File => {
  const origPath = getOriginalFilePath(file, path)
  try {
    Object.defineProperty(file, "webkitRelativePath", { value: path }) // Now, webkitRelativePath's read-only
    if (file.path === undefined) Object.defineProperty(file, "path", { value: origPath })

    return file
  } catch (e) {
    if (e instanceof TypeError && e.message.includes("Cannot redefine property")) {
      // If it's not possible to redefine the path/webkitRelativePath property, create a new File object

      const newFile = addFileProperties(file, {
        webkitRelativePath: path,
        path: origPath,
      })
      return newFile
    } else {
      console.error("Unexpected error: ", e)
      throw e
    }
  }
}

export const addFileProperties = (
  file: FileWithPath,
  // biome-ignore lint/suspicious/noExplicitAny: Any key value pair is allowed
  propertiesObject: Record<string, any>,
): File => {
  try {
    for (const [property, value] of Object.entries(propertiesObject)) {
      Object.defineProperty(file, property, { value })
    }

    return file
  } catch (e) {
    const isRedefineErr =
      e instanceof TypeError &&
      (e.message.includes("Cannot redefine property") || // chrome
        e.message.includes("can't redefine non-configurable property") || // firefox
        e.message.includes("Attempting to change value of a readonly property")) // safari
    if (isRedefineErr) {
      // If it's not possible to redefine the `property`, create a new File object
      const newFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      })

      const allPrevKeys = [
        ...Object.getOwnPropertyNames(file),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(file)),
      ]
      const prevPropertiesObject = {}
      for (const key of allPrevKeys) {
        // @ts-ignore
        const val = file[key]
        if (typeof val === "function" || val === undefined) continue
        // @ts-ignore
        prevPropertiesObject[key] = val
      }

      const fileProps = {
        ...prevPropertiesObject,
        path: file.path,
        webkitRelativePath: file.webkitRelativePath,
        ...propertiesObject,
      }

      for (const [prop, value] of Object.entries(fileProps)) {
        Object.defineProperty(newFile, prop, { value })
      }
      return newFile
    } else {
      console.error("Unexpected error: ", e)
      throw e
    }
  }
}

const removeLeadingSlash = (path: string | undefined) => {
  if (!path) return ""
  let newPath = path
  if (path.startsWith("./")) newPath = path.substring(2) // Remove leading ./
  if (path.startsWith("/")) newPath = path.substring(1) // Remove leading slash
  return newPath
}

export const fixFilePathLeadingSlashes = (files: FileWithPath[]): File[] => {
  return files.map((file) => {
    const path = removeLeadingSlash(file.path || file.relativePath || file.webkitRelativePath)
    const newFile = addFileProperties(file, {
      webkitRelativePath: path,
      path: getOriginalFilePath(file, path),
    })
    return newFile
  })
}
