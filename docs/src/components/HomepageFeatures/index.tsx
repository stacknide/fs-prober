import Heading from "@theme/Heading"
import clsx from "clsx"
import type { JSX } from "react"
import { IoMdGlobe } from "react-icons/io"
import type { IconType } from "react-icons/lib"
import { LuPlugZap } from "react-icons/lu"
import { MdOutlineRocketLaunch } from "react-icons/md"

import ss from "./styles.module.scss"

type FeatureItem = {
  id: string
  title: string
  Svg: IconType
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    id: "easy-to-use",
    title: "Effortless Setup",
    Svg: MdOutlineRocketLaunch,
    description: (
      <>
        Offers a fully-typed JavaScript API to create an HTML5-compliant drag-and-drop zone for
        files with minimal setup.
      </>
    ),
  },
  {
    id: "powereful",
    title: "Browser Compatiblity",
    // Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    Svg: IoMdGlobe,
    description: (
      <>
        It is tested with the latest versions of Chrome, Firefox, Edge, and Safari. It supports both
        the&nbsp;
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/File_and_Directory_Entries_API">
          File and Directory Entries API
        </a>
        &nbsp;and the&nbsp;
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/FileSystem">File System API</a>.
      </>
    ),
  },
  {
    id: "dropzone",
    title: "Easy Migration",
    // Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    Svg: LuPlugZap,
    description: (
      <>
        Easily migrate from <a href="https://react-dropzone.js.org/">react-dropzone</a> with drop-in
        replacements for the <code>useDropzone</code> hook and <code>Dropzone</code> component.
      </>
    ),
  },
]

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg size={64} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={ss.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props) => (
            <Feature key={props.id} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
