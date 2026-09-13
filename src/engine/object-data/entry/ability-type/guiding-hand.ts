import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class GuidingHandAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHgh") as AbilityTypeId

    /** Bonus Attack Speed Percent */
    public get bonusAttackSpeedPercentage(): number[] {
        return this.getNumberLevelField("hgh1")
    }

    public set bonusAttackSpeedPercentage(
        bonusAttackSpeedPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hgh1", bonusAttackSpeedPercentage)
    }

    /** Bonus Move Speed Percent */
    public get bonusMovementSpeedPercentage(): number[] {
        return this.getNumberLevelField("hgh2")
    }

    public set bonusMovementSpeedPercentage(
        bonusMovementSpeedPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hgh2", bonusMovementSpeedPercentage)
    }

    /** Bonus Critical Hit Percent */
    public get bonusCriticalHitPercentage(): number[] {
        return this.getNumberLevelField("hgh3")
    }

    public set bonusCriticalHitPercentage(
        bonusCriticalHitPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hgh3", bonusCriticalHitPercentage)
    }

    /** Bonus Critical Damage Percent */
    public get bonusCriticalDamagePercentage(): number[] {
        return this.getNumberLevelField("hgh4")
    }

    public set bonusCriticalDamagePercentage(
        bonusCriticalDamagePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hgh4", bonusCriticalDamagePercentage)
    }

    /** Makes Units Undying */
    public get makesUnitsUndying(): boolean[] {
        return this.getBooleanLevelField("hgh5")
    }

    public set makesUnitsUndying(
        makesUnitsUndying: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("hgh5", makesUnitsUndying)
    }

    /** Mana Per Second */
    public get manaPerSecond(): number[] {
        return this.getNumberLevelField("hgh6")
    }

    public set manaPerSecond(manaPerSecond: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hgh6", manaPerSecond)
    }

    /** Bonus Cooldown Reduction Percent */
    public get bonusCooldownReductionPercentage(): number[] {
        return this.getNumberLevelField("hgh7")
    }

    public set bonusCooldownReductionPercentage(
        bonusCooldownReductionPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hgh7", bonusCooldownReductionPercentage)
    }
}
