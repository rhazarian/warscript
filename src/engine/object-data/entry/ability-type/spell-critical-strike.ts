import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SpellCriticalStrikeAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIsc") as AbilityTypeId

    /** Chance to Critical Strike */
    public get criticalStrikePercentageProbability(): number[] {
        return this.getNumberLevelField("Ocr1")
    }

    public set criticalStrikePercentageProbability(
        criticalStrikePercentageProbability: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ocr1", criticalStrikePercentageProbability)
    }

    /** Damage Multiplier */
    public get damageFactor(): number[] {
        return this.getNumberLevelField("Ixr2")
    }

    public set damageFactor(damageFactor: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ixr2", damageFactor)
    }
}
