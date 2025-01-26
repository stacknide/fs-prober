import { fromEvent } from "file-selector"
import { useState } from "react"
import { type DropEvent, type DropzoneOptions, useDropzone } from "react-dropzone"
import {
  convertToFileList,
  filterFiles,
  fixFilePathLeadingSlashes,
  getFilesArrFromHierarchyFiles,
  getHierarchyDetailsFromFiles,
} from "./fileUtils"
import { probeHierarchy } from "./probers"
import type { HierarchyDetails, HierarchyDetailsWithoutHandles } from "./types"

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
export const useProbingDropzone = (options: DropzoneOptions = {}) => {
  const [hierarchyDetails, setHierarchyDetails] = //
    useState<HierarchyDetails | HierarchyDetailsWithoutHandles>(DEFAULT_HIERARCHY_DETAILS)

  const dropZoneProps = useDropzone({
    getFilesFromEvent: async (event) => {
      try {
        const { filesData, hierarchyDetails: hDat } = await droppedItemHierarchyProber(event)
        if (hDat) setHierarchyDetails(hDat)
        return filesData
      } catch (e) {
        if (e instanceof Error && e.message === "Unable to generate hierarchyTree for drop event") {
          // It was not a drop event. It was a click event
          const filesDraft = await fromEvent(event)
          const filteredFiles = filterFiles(filesDraft)
          const files = fixFilePathLeadingSlashes(filteredFiles)
          const hierarchyDetails = getHierarchyDetailsFromFiles(files)
          if (hierarchyDetails) setHierarchyDetails(hierarchyDetails)
          return files
        }
        throw e
      }
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
