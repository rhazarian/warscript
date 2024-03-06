import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class EnduranceAuraAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AOae") as AbilityTypeId

    public get movementSpeedIncreaseFactor(): number[] {
        return this.getNumberLevelField("Oae1")
    }

    public set movementSpeedIncreaseFactor(
        movementSpeedIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Oae1", movementSpeedIncreaseFactor)
    }

    public get autoAttackSpeedIncreaseFactor(): number[] {
        return this.getNumberLevelField("Oae2")
    }

    public set autoAttackSpeedIncreaseFactor(
        autoAttackSpeedIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Oae2", autoAttackSpeedIncreaseFactor)
    }
}
