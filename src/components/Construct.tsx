import { UnpublishedConstructType } from "../types/Construct"
import { decodeHexToCoordinates, divideBigIntsAsString } from '../libraries/Constructs'
import '../scss/UnpublishedConstruct.scss'

type UnpublishedConstructProps = {
  construct: UnpublishedConstructType
  onClick: (construct: UnpublishedConstructType) => void
  selected: boolean
}

export const UnpublishedConstruct = ({ construct, onClick, selected }: UnpublishedConstructProps) => {

  const classNames = "construct" + (selected ? " selected" : "" )

  const coords = decodeHexToCoordinates(construct.id)

  return (
    <div className={classNames} key={construct.id} onClick={() => onClick(construct)}>
      <h2>{ construct.workCompleted } POW</h2>
      <p>
        x: { ((Number(coords.x) / Number(2n**85n)) * 100 ).toFixed(0) }%<br/>
        y: { ((Number(coords.y) / Number(2n**85n)) * 100 ).toFixed(0) }%<br/>
        z: { ((Number(coords.z) / Number(2n**85n)) * 100 ).toFixed(0) }%<br/>
      </p>
      <small className="id">{ construct.id }</small>
    </div>
  )
}