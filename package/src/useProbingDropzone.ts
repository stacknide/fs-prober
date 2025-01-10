import { fromEvent } from "file-selector"
import { useRef } from "react"
import {
  type DropEvent,
  type DropzoneOptions,
  type DropzoneState,
  useDropzone,
} from "react-dropzone"
import { convertToFileList, filterFiles, getFilesArrFromHierarchyFiles } from "./fileUtils"
import { probeHierarchy } from "./probers"
import type { HierarchyDetails } from "./types"

const DEFAULT_HIERARCHY_DETAILS: HierarchyDetails = {
  emptyFolders: [],
  allFolders: [],
  allFiles: [],
  rootHandles: [],
  rootFolders: [],
  rootFiles: [],
  nameMap: new Map(),
  objectMap: new Map(),
}

/**
 * useProbingDropzone - This hook that extends the capabilities of useDropzone
 * by adding directory probing functionality enabling to detect even nested empty folders
 */
export const useProbingDropzone = (options: DropzoneOptions) => {
  const hierarchyDetails = useRef(DEFAULT_HIERARCHY_DETAILS)

  const dropZoneProps: DropzoneState = useDropzone({
    getFilesFromEvent: async (event) => {
      const { filesData, hierarchyDetails: hDat } = await droppedItemHierarchyProber(event)
      hierarchyDetails.current = hDat ?? DEFAULT_HIERARCHY_DETAILS
      return filesData
    },
    ...options,
  })

  const getFileList = (filesArray = dropZoneProps.acceptedFiles) => convertToFileList(filesArray)

  return [dropZoneProps, hierarchyDetails, { getFileList }] as const
}

export const droppedItemHierarchyProber = async (e: DropEvent) => {
  const fileSelectorFilesDataPromise = fromEvent(e)
  const hierarchyDetails = await probeHierarchy(e)
  const proberFilesData = //
    await getFilesArrFromHierarchyFiles(hierarchyDetails?.allFiles)

  const fileSelectorFilesData = await fileSelectorFilesDataPromise // more reliable than proberFilesData

  const draftFilesData = fileSelectorFilesData || proberFilesData

  const filesData = filterFiles(draftFilesData)

  return { filesData, hierarchyDetails }
}
