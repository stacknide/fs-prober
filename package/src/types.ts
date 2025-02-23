import type { DropEvent, DropzoneInputProps, DropzoneState } from "react-dropzone"

export type DataTransferDropEvent = DropEvent & { dataTransfer?: DataTransfer | null }

export type FolderNode<TFileNode = FileNode> = {
  name: string
  nameId: string
  pathIds: string[]
  kind: "directory"
  isBranch: true
  path: string
  children: (FolderNode<TFileNode> | TFileNode)[]
}

export const isFolderNode = <T>(
  node: FolderNode<T> | FileNode | FileNodeWithoutHandle,
): node is FolderNode<T> => node.kind === "directory"

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

export type HierarchyDetails<TFileNode = FileNode> = {
  emptyFolders: FolderNode<TFileNode>[]
  allFolders: FolderNode<TFileNode>[]
  rootFolders: FolderNode<TFileNode>[]
  nameMap: Map<string, string>
  objectMap: Map<string, FolderNode<TFileNode> | FileNode>
  allFiles: FileNode[]
  rootFiles: FileNode[]
  rootHandles: (FileSystemEntry | FileSystemHandle)[]
}

export type HierarchyDetailsWithoutHandles = {
  emptyFolders: HierarchyDetails<FileNodeWithoutHandle>["emptyFolders"]
  allFolders: HierarchyDetails<FileNodeWithoutHandle>["allFolders"]
  rootFolders: HierarchyDetails<FileNodeWithoutHandle>["rootFolders"]
  nameMap: HierarchyDetails<FileNodeWithoutHandle>["nameMap"]
  objectMap: Map<string, FolderNode<FileNodeWithoutHandle> | FileNodeWithoutHandle>
  allFiles: FileNodeWithoutHandle[]
  rootFiles: FileNodeWithoutHandle[]
}

export type ProbingDropzonState = DropzoneState & {
  isLoading: boolean
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T
}
