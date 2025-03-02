import { type ProbingDropzoneOptions, useProbingDropzone } from "@/useProbingDropzone"
import { type ReactNode, useEffect } from "react"
import type { DropzoneProps, DropzoneRef } from "react-dropzone"

type ProbingDropzoneProps = DropzoneProps & React.RefAttributes<DropzoneRef>

export const ProbingDropzone = ({
  children,
  onProbingDrop,
  ...options
}: {
  children: (props: ReturnType<typeof useProbingDropzone>) => React.ReactNode
  onProbingDrop: (props: ReturnType<typeof useProbingDropzone>) => void
} & ProbingDropzoneProps &
  ProbingDropzoneOptions): ReactNode => {
  const probingDropzoneProps = useProbingDropzone(options)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!probingDropzoneProps.hierarchyDetails) return
    onProbingDrop(probingDropzoneProps)
  }, [probingDropzoneProps])

  return children(probingDropzoneProps)
}
