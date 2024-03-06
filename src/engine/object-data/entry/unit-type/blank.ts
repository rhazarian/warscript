import { UnitType, UnitTypeId } from "../unit-type"

export class BlankUnitType extends UnitType {
    public static override readonly BASE_ID = fourCC("hfoo") as UnitTypeId

    protected static override readonly IS_SYNTHETIC = true
}
