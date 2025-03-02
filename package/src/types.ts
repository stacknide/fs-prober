import type { DropEvent, DropzoneState, FileWithPath } from "react-dropzone"

export type DataTransferDropEvent = DropEvent & { dataTransfer?: DataTransfer | null }

export type FolderNode<TFileNode = FileNode> = {
  name: string
  nameId: string
  pathIds: string[]
  kind: "directory"
  isBranch: true
  path: string
  children: (FolderNode<TFileNode> | TFileNode)[]
  handle: FileSystemDirectoryEntry | FileSystemDirectoryHandle
}

export type FolderNodeWithoutHandle<TFileNode = FileNodeWithoutHandle> = Omit<
  FolderNode<TFileNode>,
  "handle" | "children"
> & {
  children: (FolderNodeWithoutHandle<TFileNode> | TFileNode)[]
}

export const isFolderNode = <T>(
  node: FolderNode<T> | FolderNodeWithoutHandle<T> | FileNode | FileNodeWithoutHandle,
): node is FolderNodeWithoutHandle<T> => node.kind === "directory"

export type FileNode = {
  name: string
  nameId: string
  pathIds: string[]
  kind: "file"
  isBranch: false
  path: string
  handle: FileSystemFileHandle | FileSystemFileEntry
}
export type FileNodeWithoutHandle = Omit<FileNode, "handle">

export type HierarchyTree = {
  emptyFolders: FolderNode[]
  allFolders: FolderNode[]
  allFiles: FileNode[]
  rootHandle: FileSystemEntry | FileSystemHandle
  rootFolder: FolderNode | undefined
  rootFile: FileNode | undefined
  nameMap: Map<string, string>
  objectMap: Map<string, FolderNode | FileNode>
}

export type HierarchyDetails<TFileNode = FileNode, TFolderNode = FolderNode> = {
  emptyFolders: TFolderNode[]
  allFolders: TFolderNode[]
  rootFolders: TFolderNode[]
  nameMap: Map<string, string>
  objectMap: Map<string, TFileNode | TFolderNode>
  allFiles: TFileNode[]
  rootFiles: TFileNode[]
  rootHandles: (FileSystemEntry | FileSystemHandle)[]
}

export type HierarchyDetailsWithoutHandles = Omit<
  HierarchyDetails<FileNodeWithoutHandle, FolderNodeWithoutHandle>,
  "rootHandles"
> & {
  objectMap: Map<string, FileNodeWithoutHandle | FolderNodeWithoutHandle>
}

export type HierarchyDetailsVariant = HierarchyDetails | HierarchyDetailsWithoutHandles

export type ProbingDropzoneOptions = { isFolderSelectionMode?: boolean }
export type ProbingDropzoneState = DropzoneState & {
  isLoading: boolean
  hierarchyDetails: HierarchyDetailsVariant
  getFileList: (filesArray?: readonly FileWithPath[]) => FileList
}
