import { useProbingDropzone } from "@knide/fs-prober"
import { HierarchyDetailsTreeView } from "@site/src/components/DirectoryTree/DirectoryTree"
import { IndeterminateProgressbar } from "@site/src/components/IndeterminateProgressbar"
import Switch from "@site/src/components/Switch"
import { useEffect, useState } from "react"
import ss from "./playground.module.scss"

const Playground = () => {
  const [isFolderSelectionMode, setIsFolderSelectMode] = useState(false)

  const [dropZoneProps, hierarchyDetails] = useProbingDropzone({ isFolderSelectionMode })
  const { acceptedFiles, getRootProps, getInputProps, isLoading } = dropZoneProps

  useEffect(() => {
    if (!hierarchyDetails) return
    console.group("%cOutput", "color: yellow; font-weight: bold;")
    console.info("acceptedFiles:", acceptedFiles)
    console.info("hierarchyDetails:", hierarchyDetails)
    console.groupEnd()
  }, [acceptedFiles, hierarchyDetails])

  return (
    <>
      <h5 className={ss.selectionModes}>Selection Modes for File Selection Dialog:</h5>
      <div className={ss.modeSelector}>
        <Switch
          isChecked={isFolderSelectionMode}
          onToggle={() => setIsFolderSelectMode(!isFolderSelectionMode)}
        />
        Folder Selection Mode
      </div>

      <section className={ss.dropzoneRoot}>
        <div {...getRootProps({ className: ss.dropzone })}>
          <input {...getInputProps()} />
          <p>
            Drag 'n' drop some files & folders here, or click to select{" "}
            {isFolderSelectionMode ? "a folder" : "files"}
          </p>
        </div>
      </section>
      <aside className={ss.output}>
        <h4>Files</h4>
        <div className={ss.outputContainer}>
          <IndeterminateProgressbar style={{ opacity: isLoading ? 1 : 0 }} />
          <HierarchyDetailsTreeView hierarchyDetails={hierarchyDetails}>
            {isLoading ? "Loading..." : "Nothing to display"}
          </HierarchyDetailsTreeView>
        </div>
      </aside>
    </>
  )
}

export default Playground
