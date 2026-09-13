import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Grim Conviction (AUvg). Data G-I are used by the Avatar of Light variant (AHal).
 */
export class GrimConvictionAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUvg") as AbilityTypeId

    /** % Health Cost */
    public get healthCostPercentage(): number[] {
        return this.getNumberLevelField("uvg1")
    }

    public set healthCostPercentage(
        healthCostPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uvg1", healthCostPercentage)
    }

    /** Bonus strength */
    public get bonusStrength(): number[] {
        return this.getNumberLevelField("uvg2")
    }

    public set bonusStrength(bonusStrength: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("uvg2", bonusStrength)
    }

    /** % Bonus Resolve */
    public get bonusResolvePercentage(): number[] {
        return this.getNumberLevelField("uvg3")
    }

    public set bonusResolvePercentage(
        bonusResolvePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uvg3", bonusResolvePercentage)
    }

    /** % Bonus Life Steal */
    public get bonusLifeStealPercentage(): number[] {
        return this.getNumberLevelField("uvg4")
    }

    public set bonusLifeStealPercentage(
        bonusLifeStealPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uvg4", bonusLifeStealPercentage)
    }

    /** % Bonus Spell Vamp */
    public get bonusSpellVampPercentage(): number[] {
        return this.getNumberLevelField("uvg5")
    }

    public set bonusSpellVampPercentage(
        bonusSpellVampPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uvg5", bonusSpellVampPercentage)
    }

    /** Double bonus bellow health % */
    public get doubleBonusBelowHealthPercentage(): number[] {
        return this.getNumberLevelField("uvg6")
    }

    public set doubleBonusBelowHealthPercentage(
        doubleBonusBelowHealthPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uvg6", doubleBonusBelowHealthPercentage)
    }

    /** Damage On Cast */
    public get damageOnCast(): number[] {
        return this.getNumberLevelField("uvg7")
    }

    public set damageOnCast(damageOnCast: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("uvg7", damageOnCast)
    }

    /** % Bonus Spell Crit */
    public get bonusSpellCriticalStrikePercentage(): number[] {
        return this.getNumberLevelField("uvg8")
    }

    public set bonusSpellCriticalStrikePercentage(
        bonusSpellCriticalStrikePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uvg8", bonusSpellCriticalStrikePercentage)
    }

    /** % Bonus Spell Crit Damage */
    public get bonusSpellCriticalStrikeDamagePercentage(): number[] {
        return this.getNumberLevelField("uvg9")
    }

    public set bonusSpellCriticalStrikeDamagePercentage(
        bonusSpellCriticalStrikeDamagePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uvg9", bonusSpellCriticalStrikeDamagePercentage)
    }
}
