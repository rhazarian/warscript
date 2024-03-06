import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SearingArrowsAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHfa") as AbilityTypeId

    public get damageIncrease(): number[] {
        return this.getNumberLevelField("Hfa1")
    }

    public set damageIncrease(damageIncrease: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hfa1", damageIncrease)
    }
}
