import clsx from "clsx"
import ss from "./switch.module.scss"

const Switch = ({ isChecked, onToggle }: { isChecked: boolean; onToggle: () => void }) => {
  return (
    <label className={ss.switch}>
      <input type="checkbox" checked={isChecked} onChange={onToggle} />
      <span className={clsx(ss.slider, ss.round)} />
    </label>
  )
}

export default Switch
