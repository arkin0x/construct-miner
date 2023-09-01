import { UnpublishedConstructType } from "../types/Construct"

type UnpublishedConstructProps = {
  construct: UnpublishedConstructType
  onClick: (construct: UnpublishedConstructType) => void
}

export const UnpublishedConstruct = ({ construct, onClick }: UnpublishedConstructProps) => {


  return (
    <div className="construct" key={construct.id} onClick={() => onClick(construct)}>
      <h2>{ construct.workCompleted }pow</h2>
      <small>{ construct.id }</small>
    </div>
  )
}