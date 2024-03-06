import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SpiritTouchAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Arpm") as AbilityTypeId

    public get manaGain(): number[] {
        return this.getNumberLevelField("Rej2")
    }

    public set manaGain(manaGain: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Rej2", manaGain)
    }

    public get manaRequirement(): number[] {
        return this.getNumberLevelField("Rpb4")
    }

    public set manaRequirement(manaRequirement: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Rpb4", manaRequirement)
    }

    public get maximumTargetCount(): number[] {
        return this.getNumberLevelField("Rpb5")
    }

    public set maximumTargetCount(
        maximumTargetCount: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Rpb5", maximumTargetCount)
    }

    public get maximumManaCostFactor(): number[] {
        return this.getNumberLevelField("Rpb6")
    }

    public set maximumManaCostFactor(
        maximumManaCostFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Rpb6", maximumManaCostFactor)
    }
}
