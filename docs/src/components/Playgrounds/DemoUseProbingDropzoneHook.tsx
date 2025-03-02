import { useProbingDropzone } from "@knide/fs-prober/react"
import { OutputWindow } from "@site/src/components/Playgrounds/OutputWindow"
import Switch from "@site/src/components/Switch"
import { useEffect, useState } from "react"

import ss from "./playgrounds.module.scss"

const DemoUseProbingDropzoneHook = () => {
  const [isFolderSelectionMode, setIsFolderSelectMode] = useState(false)

  const { acceptedFiles, getRootProps, getInputProps, isLoading, hierarchyDetails } =
    useProbingDropzone({ isFolderSelectionMode })

  useEffect(() => {
    if (!hierarchyDetails) return
    console.group("%cuseProbingDropzone Output", "color: yellow; font-weight: bold;")
    console.info("acceptedFiles:", acceptedFiles)
    console.info("hierarchyDetails:", hierarchyDetails)
    console.groupEnd()
  }, [acceptedFiles, hierarchyDetails])

  return (
    <>
      <h4 className={ss.selectionModes}>Selection Modes for File Selection Window:</h4>
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

      <OutputWindow hierarchyDetails={hierarchyDetails} isLoading={isLoading} />
    </>
  )
}

export default DemoUseProbingDropzoneHook
