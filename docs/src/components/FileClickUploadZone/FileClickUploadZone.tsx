import { getHierarchyDetailsFromFiles } from "@knide/fs-prober/src/fileUtils"
import PropTypes from "prop-types"
import Dropzone, { useDropzone } from "react-dropzone"

export const FileClickUploadZone = ({ disable, handleUpload, children, className }) => {
  // ref => https://github.com/react-dropzone/react-dropzone/issues/1097
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const hierarchyDetails = getHierarchyDetailsFromFiles(acceptedFiles)
      handleUpload(acceptedFiles, hierarchyDetails)
    },
    noDrag: true,
  })

  if (disable) return children
  return (
    <div className={className}>
      <Dropzone
        useFsAccessApi={false} // https://github.com/react-dropzone/react-dropzone/issues/1127`
      >
        {() => (
          <div {...getRootProps()}>
            {children}
            <input data-testid="file-input" {...getInputProps()} />
          </div>
        )}
      </Dropzone>
    </div>
  )
}

FileClickUploadZone.propTypes = {
  disable: PropTypes.bool,
  handleUpload: PropTypes.func.isRequired,
  dropzoneProps: PropTypes.object,
  children: PropTypes.node,
  className: PropTypes.string,
}
