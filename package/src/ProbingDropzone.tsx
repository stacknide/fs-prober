import type { ProbingDropzoneOptions, ProbingDropzoneState } from "@/types"
import { useProbingDropzone } from "@/useProbingDropzone"
import { forwardRef, useEffect, useImperativeHandle } from "react"
import type { DropzoneProps, DropzoneRef } from "react-dropzone"

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (probingDropzoneState.hierarchyDetails && onProbingDrop) onProbingDrop(probingDropzoneState)
  }, [probingDropzoneState])

  return children(probingDropzoneState)
})
