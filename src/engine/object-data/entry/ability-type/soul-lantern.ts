import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SoulLanternAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUla") as AbilityTypeId

    /** Ally Mana Per Second */
    public get allyManaPerSecond(): number[] {
        return this.getNumberLevelField("ula1")
    }

    public set allyManaPerSecond(
        allyManaPerSecond: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ula1", allyManaPerSecond)
    }

    /** Ally Healing Per Second */
    public get allyHealingPerSecond(): number[] {
        return this.getNumberLevelField("ula2")
    }

    public set allyHealingPerSecond(
        allyHealingPerSecond: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ula2", allyHealingPerSecond)
    }

    /** Ally Spell Resist Percent */
    public get allySpellResistancePercentage(): number[] {
        return this.getNumberLevelField("ula3")
    }

    public set allySpellResistancePercentage(
        allySpellResistancePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ula3", allySpellResistancePercentage)
    }

    /** Ally Spell Amp Percent */
    public get allySpellAmpPercentage(): number[] {
        return this.getNumberLevelField("ula4")
    }

    public set allySpellAmpPercentage(
        allySpellAmpPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ula4", allySpellAmpPercentage)
    }

    /** Ally Spell Crit Hit Percent */
    public get allySpellCriticalHitPercentage(): number[] {
        return this.getNumberLevelField("ula5")
    }

    public set allySpellCriticalHitPercentage(
        allySpellCriticalHitPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ula5", allySpellCriticalHitPercentage)
    }

    /** Ally Movement Speed Percent */
    public get allyMovementSpeedPercentage(): number[] {
        return this.getNumberLevelField("ula6")
    }

    public set allyMovementSpeedPercentage(
        allyMovementSpeedPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ula6", allyMovementSpeedPercentage)
    }

    /** Enemy Mana Per Second */
    public get enemyManaPerSecond(): number[] {
        return this.getNumberLevelField("ula7")
    }

    public set enemyManaPerSecond(
        enemyManaPerSecond: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ula7", enemyManaPerSecond)
    }

    /** Enemy Damage Per Second */
    public get enemyDamagePerSecond(): number[] {
        return this.getNumberLevelField("ula8")
    }

    public set enemyDamagePerSecond(
        enemyDamagePerSecond: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ula8", enemyDamagePerSecond)
    }
}
