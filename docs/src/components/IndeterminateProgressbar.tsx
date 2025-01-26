import { useMemo } from "react"
import ss from "./indeterminate-progressbar.module.scss"

export const IndeterminateProgressbar = ({
  delay = 0,
  addRandomDelay = false,
  ...props
}: {
  delay?: number
  addRandomDelay?: boolean
} & React.HTMLAttributes<HTMLSpanElement>) => {
  const newDelay = useMemo(() => {
    if (!addRandomDelay) return delay
    const delays = [100, 200, 300, 400]
    return delays[Math.floor(Math.random() * delays.length)]
  }, [delay, addRandomDelay])

  const delayStyle = { animationDelay: `${newDelay}ms` }
  return (
    <span className={ss.base} {...props}>
      <span className={ss.runner1} style={delayStyle} />
      <span className={ss.runner2} style={delayStyle} />
    </span>
  )
}
