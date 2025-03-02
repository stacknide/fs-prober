import { ProbingDropzone } from "@knide/fs-prober/react"
import { OutputWindow } from "@site/src/components/Playgrounds/OutputWindow"
import Switch from "@site/src/components/Switch"
import { useState } from "react"

import ss from "./playgrounds.module.scss"

const DemoProbingDropzoneCompo = () => {
  const [isFolderSelectionMode, setIsFolderSelectMode] = useState(false)

  return (
    <>
      <h5 className={ss.selectionModes}>Selection Modes for File Selection Window:</h5>
      <div className={ss.modeSelector}>
        <Switch
          isChecked={isFolderSelectionMode}
          onToggle={() => setIsFolderSelectMode(!isFolderSelectionMode)}
        />
        Folder Selection Mode
      </div>

      <ProbingDropzone
        onProbingDrop={({ acceptedFiles, hierarchyDetails }) => {
          if (!hierarchyDetails) return
          console.group("%cProbingDropzone Output", "color: yellow; font-weight: bold;")
          console.info("acceptedFiles:", acceptedFiles)
          console.info("hierarchyDetails:", hierarchyDetails)
          console.groupEnd()
        }}
      >
        {({ getRootProps, getInputProps, hierarchyDetails, isLoading }) => (
          <>
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
        )}
      </ProbingDropzone>
    </>
  )
}

export default DemoProbingDropzoneCompo
