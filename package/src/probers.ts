import flatMap from "lodash.flatmap"
import map from "lodash.map"
import { nanoid } from "nanoid"
import {
  getDirHandleEntries,
  getHandleKind,
  getRootHandle,
  isDirEntry,
  isFileEntry,
} from "./proberWebApi"
import type {
  DataTransferDropEvent,
  FileNode,
  FolderNode,
  HierarchyDetails,
  HierarchyTree,
} from "./types"

export const probeHierarchy = async (
  event: DataTransferDropEvent,
): Promise<HierarchyDetails | null> => {
  if (!event.dataTransfer) throw new Error("Unable to generate hierarchyTree for drop event")
  type RootHandle = NonNullable<ReturnType<typeof getRootHandle>>
  const rootHandleDrafts: Array<RootHandle> = []
  for (let i = 0; i < event.dataTransfer.items.length; i++) {
    try {
      const draftRootHandle = getRootHandle(event, i)
      if (draftRootHandle === null || draftRootHandle === undefined) return null // Return because nothing is dropped yet
      rootHandleDrafts.push(draftRootHandle)
    } catch (error) {
      console.error(`Error probing item ${i}:`, error)
    }
  }

  const probeResults: HierarchyTree[] = []
  for (let i = 0; i < rootHandleDrafts.length; i++) {
    const rootHandle = await rootHandleDrafts[i]
    if (!rootHandle) continue
    const probeResult = await fsProber(rootHandle, false)
    if (probeResult) probeResults.push(probeResult)
  }

  return mergeProbeResults(probeResults)
}

export const getPathByPathIds = (pathIds: string[], nameMap: Map<string, string>): string => {
  let path = ""
  for (const pathId of pathIds) {
    const name = nameMap.get(pathId)
    if (!name) throw new Error(`Name not found for pathId: ${pathId}`)
    path = `${path}/${name}`
  }
  return path
}

export const getNameId = (name: string, nameMap: Map<string, string>): string => {
  const nameId = nanoid()
  nameMap.set(nameId, name)
  return nameId
}

export function fsProber(
  rootHandle: FileSystemEntry | FileSystemHandle,
  autoMerge: false,
): Promise<HierarchyTree | null>
export function fsProber(
  rootHandle: FileSystemEntry | FileSystemHandle,
  autoMerge: false,
): Promise<HierarchyDetails | null>
export async function fsProber(rootHandle: FileSystemEntry | FileSystemHandle, autoMerge = true) {
  if (!rootHandle) return null

  const objectMap = new Map<string, FileNode | FolderNode>()
  const nameMap = new Map<string, string>()
  const hierarchyTree: HierarchyTree = {
    emptyFolders: [],
    allFolders: [],
    allFiles: [],
    rootHandle,
    rootFolder: undefined,
    rootFile: undefined,
    nameMap,
    objectMap,
  }

  const path = rootHandle.name
  if (isDirEntry(rootHandle)) {
    const lookupMaps = { objectMap, nameMap }
    await traverseDirectory(rootHandle, path, hierarchyTree, lookupMaps)
    hierarchyTree.rootFolder = hierarchyTree.allFolders[hierarchyTree.allFolders.length - 1]

    // If the there is only one folder in `allFolders` and that too is empty, then it surely couldn't have executed hierarchyDetails.emptyFolders. So lets's check for that

    const hasNotEnteredTraversals =
      hierarchyTree.allFolders.length === 1 && hierarchyTree.allFolders[0]?.children.length === 0
    if (hasNotEnteredTraversals && hierarchyTree.allFolders[0]) {
      hierarchyTree.emptyFolders.push(hierarchyTree.allFolders[0])
    }
  } else if (isFileEntry(rootHandle)) {
    const nameId = getNameId(rootHandle.name, nameMap)
    const file: FileNode = {
      name: rootHandle.name,
      nameId,
      pathIds: [nameId],
      kind: "file",
      isBranch: false,
      path,
      handle: rootHandle,
    }
    objectMap.set(nameId, file)
    hierarchyTree.allFiles.push(file)

    hierarchyTree.rootFile = file
  }

  hierarchyTree.nameMap = nameMap
  hierarchyTree.objectMap = objectMap
  if (!autoMerge) return hierarchyTree
  else return mergeProbeResults([hierarchyTree])
}

const traverseDirectory = async (
  dirHandle: FileSystemDirectoryEntry | FileSystemDirectoryHandle,
  currentPath: string,
  hierarchyTree: HierarchyTree,
  lookupMaps: { objectMap: HierarchyTree["objectMap"]; nameMap: HierarchyTree["nameMap"] },
  pathIds: string[] = [],
) => {
  const handleKind = getHandleKind(dirHandle)
  if (handleKind !== "directory") return
  const { objectMap, nameMap } = lookupMaps
  const folderNameId = getNameId(dirHandle.name, nameMap)
  const folderDetails: FolderNode = {
    name: dirHandle.name,
    nameId: folderNameId,
    pathIds: [...pathIds, folderNameId],
    kind: handleKind, // always "directory"
    isBranch: true,
    path: currentPath,
    children: [],
  }
  objectMap.set(folderNameId, folderDetails)

  const dirEntries = await getDirHandleEntries(dirHandle)

  for (const [name, handle] of dirEntries) {
    const path = `${currentPath}/${name}`

    const entryHandleKind = getHandleKind(handle)
    if (entryHandleKind === "file" && isFileEntry(handle)) {
      const nameId = getNameId(handle.name, nameMap)
      const file: FileNode = {
        path,
        pathIds: [...pathIds, folderNameId, nameId],
        name: handle.name,
        nameId,
        kind: entryHandleKind,
        isBranch: false,
        handle,
      }
      objectMap.set(nameId, file)
      hierarchyTree.allFiles.push(file)
      folderDetails.children.push(file)
    } else if (isDirEntry(handle)) {
      const cpids = [...pathIds, folderNameId] // childPathIds
      const lkupMaps = { objectMap, nameMap }
      const childDetails = //
        await traverseDirectory(handle, path, hierarchyTree, lkupMaps, cpids)
      if (childDetails) {
        if (childDetails.children.length === 0) {
          hierarchyTree.emptyFolders.push(childDetails)
        }

        folderDetails.children.push(childDetails)
      }
    }
  }

  hierarchyTree.allFolders.push(folderDetails)

  return folderDetails
}

const mergeProbeResults = (probeResults: HierarchyTree[]) => {
  if (!probeResults || probeResults.length === 0) return null

  let mergedNameMapArray: [string, string][] = []
  probeResults.forEach((probeResult) => {
    mergedNameMapArray = [...mergedNameMapArray, ...probeResult.nameMap]
  })

  let mergedObjectMapArray: [string, FolderNode | FileNode][] = []
  probeResults.forEach((probeResult) => {
    mergedObjectMapArray = [...mergedObjectMapArray, ...probeResult.objectMap]
  })

  const merged: HierarchyDetails = {
    emptyFolders: flatMap(probeResults, "emptyFolders"),
    allFolders: flatMap(probeResults, "allFolders"),
    allFiles: flatMap(probeResults, "allFiles"),
    rootHandles: map(probeResults, "rootHandle"),
    rootFolders: map(probeResults, "rootFolder").filter(Boolean) as FolderNode[],
    rootFiles: map(probeResults, "rootFile").filter(Boolean) as FileNode[],
    nameMap: new Map(mergedNameMapArray),
    objectMap: new Map(mergedObjectMapArray),
  }

  return merged
}
