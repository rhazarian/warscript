import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class AutoAttackSpeedIncreaseAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIsx") as AbilityTypeId

    public get autoAttackSpeedIncreaseFactor(): number[] {
        return this.getNumberLevelField("Isx1")
    }

    public set autoAttackSpeedIncreaseFactor(
        autoAttackSpeedIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Isx1", autoAttackSpeedIncreaseFactor)
    }
}
