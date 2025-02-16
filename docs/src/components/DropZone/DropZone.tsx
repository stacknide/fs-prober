import { useProbingDropzone } from "@knide/fs-prober/react"
import PropTypes from "prop-types"
import { type CSSProperties, useEffect, useRef, useState } from "react"

import stl from "./dropzone.module.scss"

/**
 * An absolute positioned dropzone that only appears when you drag files into it. (No click upload accepted)
 */
export const DropZone = ({ disable, shouldUploadonDrop, handleUpload }) => {
  const { isDragOver, setIsDragOver, dropZoneRootRef } = useDragEvents()
  const didDropOccur = useRef(false)

  const onDrop = () => {
    setIsDragOver(false)
    didDropOccur.current = true
  }
  const [dropZoneProps, hierarchyDetails] = //
    useProbingDropzone({ noClick: true, onDrop, noDrag: !shouldUploadonDrop })

  const { acceptedFiles, getRootProps, getInputProps } = dropZoneProps

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (didDropOccur.current) {
      handleUpload(acceptedFiles, hierarchyDetails)
    }

    didDropOccur.current = false
  }, [acceptedFiles])

  const containerStyles: CSSProperties = {
    visibility: isDragOver ? "visible" : "hidden",
    opacity: isDragOver ? 1 : 0,
    zIndex: isDragOver ? 99999999 : -1,
    transition: "visibility 0s, opacity 0.5s",
  }

  if (disable) return null
  return (
    <section
      className={stl.dropZoneRoot}
      style={containerStyles}
      ref={dropZoneRootRef}
      onClick={() => setIsDragOver(false)}
    >
      <div {...getRootProps({ className: stl.dropZone })}>
        <input {...getInputProps()} />
      </div>
    </section>
  )
}

DropZone.propTypes = {
  disable: PropTypes.bool,
  shouldUploadonDrop: PropTypes.bool,
  handleUpload: PropTypes.func.isRequired,
}

const useDragEvents = () => {
  const [isDragOver, setIsDragOver] = useState(false)
  const dropZoneRootRef = useRef(null)

  useEffect(() => {
    const handleDragOver = (event) => {
      event.preventDefault()

      if (!dropZoneRootRef.current) return
      const dropZoneRect = dropZoneRootRef.current.getBoundingClientRect()
      const mouseX = event.clientX
      const mouseY = event.clientY

      const isInside =
        mouseX > dropZoneRect.left &&
        mouseX < dropZoneRect.right &&
        mouseY > dropZoneRect.top &&
        mouseY < dropZoneRect.bottom
      if (isInside) setIsDragOver(true)
    }

    const handleDragLeave = (event) => {
      if (!dropZoneRootRef.current) return
      const dropZoneRect = dropZoneRootRef.current.getBoundingClientRect()
      const mouseX = event.clientX
      const mouseY = event.clientY

      const isOutside =
        mouseX < dropZoneRect.left ||
        mouseX > dropZoneRect.right ||
        mouseY < dropZoneRect.top ||
        mouseY > dropZoneRect.bottom
      if (isOutside) setIsDragOver(false)
    }

    window.addEventListener("dragover", handleDragOver)
    window.addEventListener("dragleave", handleDragLeave)

    return () => {
      window.removeEventListener("dragover", handleDragOver)
      window.removeEventListener("dragleave", handleDragLeave)
    }
  }, [])

  return { isDragOver, dropZoneRootRef, setIsDragOver }
}
