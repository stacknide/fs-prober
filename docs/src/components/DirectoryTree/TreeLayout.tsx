import TreeView, { flattenTree, type INode } from "react-accessible-treeview"
import type { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils"
import { IconContext } from "react-icons/lib"
import { MdFilePresent, MdFolder, MdFolderOpen } from "react-icons/md"
import { AnimatedContainer } from "./AnimatedContainer"

type TreeData = Parameters<typeof flattenTree>[0]
export type TreeLayoutProps = {
  treeData: TreeData[]
  onNodeClick?: ({
    element,
    isBranch,
    level,
  }: {
    element: INode<IFlatMetadata>
    isBranch: boolean
    level: number
  }) => void
}

export const TreeLayout = ({ treeData, onNodeClick }: TreeLayoutProps) => {
  const folder: TreeData = { name: "3werqe", children: treeData }
  const data = flattenTree(folder)
  return (
    <TreeView
      data={data}
      togglableSelect
      clickAction="EXCLUSIVE_SELECT"
      multiSelect
      nodeRenderer={({ element, isBranch, isExpanded, getNodeProps, level }) => {
        const clickableClass = onNodeClick || isBranch ? "clickable-node" : ""

        const nonBranchLeafClass = isBranch ? "" : "non-branch-leaf"
        const className = `${nonBranchLeafClass} ${getNodeProps().className}`

        const onMouseDown = () => onNodeClick?.({ element, isBranch, level })

        return (
          <AnimatedContainer id={`node-${element.name}`}>
            <div
              {...getNodeProps()}
              className={`${className} ${clickableClass}`}
              style={{ paddingLeft: 20 * (level - 1) }}
              key={`node-${element.name}`}
              onMouseDown={onMouseDown}
            >
              <IconContext.Provider value={{ className: "icon", color: "#5F647F", size: "25px" }}>
                {isBranch ? ( //
                  isExpanded ? (
                    <MdFolderOpen />
                  ) : (
                    <MdFolder />
                  )
                ) : (
                  <MdFilePresent />
                )}
                <p className="node-name">{element.name}</p>
              </IconContext.Provider>
            </div>
          </AnimatedContainer>
        )
      }}
    />
  )
}
