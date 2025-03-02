import type { HierarchyDetailsVariant } from "@knide/fs-prober"
import clsx from "clsx"
import { useMemo } from "react"
import { AnimatedContainer } from "./AnimatedContainer"
import { TreeLayout, type TreeLayoutProps } from "./TreeLayout"

import "./directory-tree.scss"

type DirectoryTreeProps = {
  treeData: TreeLayoutProps["treeData"]
  title?: string
  titleIcon?: React.ReactNode
  children?: React.ReactNode
  className?: string
  onNodeClick?: TreeLayoutProps["onNodeClick"]
}

export const DirectoryTree = ({
  treeData,
  title,
  titleIcon,
  /** `<NoTreeData />` component (default fallback component) */
  children,
  className,
  onNodeClick,
}: DirectoryTreeProps) => {
  const noTreeData = !treeData?.length

  return (
    <AnimatedContainer id="directory-tree" className={clsx("ide", className)}>
      <Title title={title} key="title" icon={titleIcon} />
      {noTreeData ? (
        <>{children}</>
      ) : (
        <div key="tree-root">
          <TreeLayout treeData={treeData} onNodeClick={onNodeClick} />
        </div>
      )}
    </AnimatedContainer>
  )
}

const Title = ({ title, icon = null }) => {
  if (!title) return <></>
  return (
    <section>
      <h2 className="dir-tree-title">
        {icon}
        {title}
      </h2>
      <hr />
    </section>
  )
}

type HierarchyDetailsTreeViewProps = {
  hierarchyDetails: HierarchyDetailsVariant
} & Partial<DirectoryTreeProps>
export const HierarchyDetailsTreeView = ({
  hierarchyDetails,
  ...props
}: HierarchyDetailsTreeViewProps) => {
  const treeData = useMemo(() => flatten(hierarchyDetails), [hierarchyDetails])

  return <DirectoryTree treeData={treeData} {...props} />
}

export const flatten = (hDet: HierarchyDetailsVariant): TreeLayoutProps["treeData"] => {
  if (!hDet) return []

  const rootFiles = Array.isArray(hDet.rootFiles) ? hDet.rootFiles : []
  const rootFolders = Array.isArray(hDet.rootFolders) ? hDet.rootFolders : []

  const rootObjs = [...rootFiles, ...rootFolders]
  return rootObjs
}
