import type { HierarchyDetails, HierarchyDetailsVariant, ProbingDropzonState } from "@/types"
import { type FileWithPath, fromEvent } from "file-selector"
import { useCallback, useMemo, useState } from "react"
import { type DropEvent, type DropzoneOptions, useDropzone } from "react-dropzone"
import {
  convertToFileList,
  filterFiles,
  fixFilePathLeadingSlashes,
  getFilesArrFromHierarchyFiles,
  getHierarchyDetailsFromFiles,
} from "./fileUtils"
import { probeHierarchy } from "./probers"

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

export type ProbingDropzoneOptions = { isFolderSelectionMode?: boolean }
/**
 * useProbingDropzone - This hook that extends the capabilities of useDropzone
 * by adding directory probing functionality enabling to detect even nested empty folders
 */
export const useProbingDropzone = (
  options: DropzoneOptions & ProbingDropzoneOptions = {},
): ProbingDropzonState & {
  hierarchyDetails: HierarchyDetailsVariant
  getFileList: (filesArray?: readonly FileWithPath[]) => FileList
} => {
  const [hierarchyDetails, setHierarchyDetails] = //
    useState<HierarchyDetailsVariant>(DEFAULT_HIERARCHY_DETAILS)

  const [isLoading, setIsLoading] = useState(false)
  const defaultDropzoneProps = useDropzone({
    getFilesFromEvent: async (event) => {
      setIsLoading(true)
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
      } finally {
        setIsLoading(false)
      }
    },
    ...options,
  })

  const customGetInputProps: typeof defaultDropzoneProps.getInputProps = useCallback(
    (props) => {
      // Ref: https://stackoverflow.com/a/42633404/12872199
      const folderSelectionModeProps = options.isFolderSelectionMode
        ? {
            webkitdirectory: "",
            mozdirectory: "",
            directory: "",
            allowdirs: "",
            msdirectory: "",
            odirectory: "",
          }
        : {}
      return { ...defaultDropzoneProps.getInputProps(props), ...folderSelectionModeProps }
    },
    [defaultDropzoneProps.getInputProps, options.isFolderSelectionMode],
  )
  const dropzoneProps = useMemo(() => {
    return { ...defaultDropzoneProps, getInputProps: customGetInputProps, isLoading }
  }, [customGetInputProps, defaultDropzoneProps, isLoading])

  const probingDropzoneProps = useMemo(() => {
    const getFileList = (filesArray = defaultDropzoneProps.acceptedFiles) =>
      convertToFileList(filesArray)
    return { ...dropzoneProps, hierarchyDetails, getFileList }
  }, [dropzoneProps, hierarchyDetails, defaultDropzoneProps.acceptedFiles])

  return probingDropzoneProps
}

export const droppedItemHierarchyProber = async (
  e: DropEvent,
): Promise<{
  filesData: FileWithPath[]
  hierarchyDetails: HierarchyDetails | null | undefined
}> => {
  const fileSelectorFilesDataPromise = fromEvent(e)

  const hierarchyDetails = await probeHierarchy(e)
  const proberFilesData = //
    await getFilesArrFromHierarchyFiles(hierarchyDetails?.allFiles)

  const fileSelectorFilesData = await fileSelectorFilesDataPromise // more reliable than proberFilesData

  const draftFilesData = fileSelectorFilesData || proberFilesData

  const filesData = filterFiles(draftFilesData)

  return { filesData, hierarchyDetails }
}
