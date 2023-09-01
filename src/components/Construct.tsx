import { UnpublishedConstructType } from "../types/Construct"
import '../scss/UnpublishedConstruct.scss'

type UnpublishedConstructProps = {
  construct: UnpublishedConstructType
  onClick: (construct: UnpublishedConstructType) => void
  selected: boolean
}

export const UnpublishedConstruct = ({ construct, onClick, selected }: UnpublishedConstructProps) => {

  const classNames = "construct" + (selected ? " selected" : "" )

  return (
    <div className={classNames} key={construct.id} onClick={() => onClick(construct)}>
      <h2>{ construct.workCompleted }pow</h2>
      <small>{ construct.id }</small>
    </div>
  )
}