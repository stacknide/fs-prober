import { useProbingDropzone } from "@knide/fs-prober/src/useProbingDropzone"
import { HierarchyDetailsTreeView } from "@site/src/components/DirectoryTree/DirectoryTree"
import { useEffect } from "react"
import ss from "./playground.module.scss"

/*
const Playground = () => {
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false)

  const [hierarchyDetails, setHierarchyDetails] = useState(null)
  const [files, setFiles] = useState([])

  const handleUpload = async (acceptedFiles, hierarchyDetails) => {
    setFiles(acceptedFiles)
    setHierarchyDetails(hierarchyDetails)
    setIsFileUploadDialogOpen(true)
  }

  return (
    <div className={ss.dropZone}>
      <DropZone handleUpload={handleUpload} />
    </div>
  )
}

export default Playground
*/
const Playground = () => {
  const [dropZoneProps, hierarchyDetails] = useProbingDropzone()
  const { acceptedFiles, getRootProps, getInputProps } = dropZoneProps

  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log("Output")
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log("acceptedFiles", acceptedFiles)
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log("hierarchyDetails", hierarchyDetails)
  })
  return (
    <>
      <section className={ss.dropzoneRoot}>
        <div {...getRootProps({ className: ss.dropzone })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
      </section>
      <aside className={ss.output}>
        <h4>Files</h4>
        <HierarchyDetailsTreeView hierarchyDetails={hierarchyDetails}>
          Nothing to display
        </HierarchyDetailsTreeView>
      </aside>
    </>
  )
}

export default Playground
