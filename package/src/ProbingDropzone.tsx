import { forwardRef, useEffect, useImperativeHandle } from "react"
import type { DropzoneProps, DropzoneRef } from "react-dropzone"
import type { ProbingDropzoneOptions, ProbingDropzoneState } from "@/types"
import { useProbingDropzone } from "@/useProbingDropzone"

type ProbingDropzoneProps = Omit<DropzoneProps, "children"> & {
  children: (props: ProbingDropzoneState) => React.ReactNode
  onProbingDrop?: (props: ProbingDropzoneState) => void
} & ProbingDropzoneOptions

export const ProbingDropzone: React.ForwardRefExoticComponent<
  ProbingDropzoneProps & React.RefAttributes<DropzoneRef>
> = forwardRef<DropzoneRef, ProbingDropzoneProps>(function ProbingDropzone(
  { children, onProbingDrop, ...options },
  ref,
) {
  const probingDropzoneState = useProbingDropzone(options)

  useImperativeHandle(ref, () => ({ open: probingDropzoneState.open }), [probingDropzoneState.open])

  useEffect(() => {
    if (probingDropzoneState.hierarchyDetails && onProbingDrop) onProbingDrop(probingDropzoneState)
  }, [probingDropzoneState])

  return children(probingDropzoneState)
})
