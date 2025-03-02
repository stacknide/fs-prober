import type { HierarchyDetailsVariant } from "@knide/fs-prober"
import { HierarchyDetailsTreeView } from "@site/src/components/DirectoryTree/DirectoryTree"
import { IndeterminateProgressbar } from "@site/src/components/IndeterminateProgressbar"

import ss from "./playgrounds.module.scss"

export const OutputWindow = ({
  hierarchyDetails,
  isLoading,
}: {
  hierarchyDetails: HierarchyDetailsVariant
  isLoading: boolean
}) => {
  return (
    <aside className={ss.output}>
      <h4>Files</h4>
      <div className={ss.outputContainer}>
        <IndeterminateProgressbar style={{ opacity: isLoading ? 1 : 0 }} />
        <HierarchyDetailsTreeView hierarchyDetails={hierarchyDetails}>
          {isLoading ? "Loading..." : "Nothing to display"}
        </HierarchyDetailsTreeView>
      </div>
    </aside>
  )
}
