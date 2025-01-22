import { AnimatePresence, motion } from "framer-motion"
import type { ComponentProps } from "react"

type AnimatedContainerProps = {
  children: React.ReactNode
  id: string
} & ComponentProps<typeof motion.div>

export const AnimatedContainer = ({ children, id, ...props }: AnimatedContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{ opacity: 0, y: -20 }}
      key={id}
      {...props}
    >
      <AnimatePresence key={`ap-${id}`}>{children}</AnimatePresence>
    </motion.div>
  )
}
