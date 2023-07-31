import { UnpublishedConstructType } from "../types/Construct";

type UnpublishedConstructProps = {
  construct: UnpublishedConstructType
}

export const UnpublishedConstruct = ({ construct }: UnpublishedConstructProps) => {


  return (
    <div className="construct">
      { construct.id }
    </div>
  )
}