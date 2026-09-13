import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ConsecrationAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHcr") as AbilityTypeId

    /** Ally Healing Per Second */
    public get allyHealingPerSecond(): number[] {
        return this.getNumberLevelField("hcr1")
    }

    public set allyHealingPerSecond(
        allyHealingPerSecond: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hcr1", allyHealingPerSecond)
    }

    /** Enemy Damage Per Second */
    public get enemyDamagePerSecond(): number[] {
        return this.getNumberLevelField("hcr2")
    }

    public set enemyDamagePerSecond(
        enemyDamagePerSecond: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hcr2", enemyDamagePerSecond)
    }

    /** Enemy Healing Reduction Percent */
    public get enemyHealingReductionPercentage(): number[] {
        return this.getNumberLevelField("hcr3")
    }

    public set enemyHealingReductionPercentage(
        enemyHealingReductionPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hcr3", enemyHealingReductionPercentage)
    }
}
