import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class CleansingFireAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHcl") as AbilityTypeId

    /** Ally Healing Base */
    public get allyBaseHealing(): number[] {
        return this.getNumberLevelField("hcl1")
    }

    public set allyBaseHealing(allyBaseHealing: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hcl1", allyBaseHealing)
    }

    /** Ally Healing Per Debuff Removed */
    public get allyHealingPerDebuffRemoved(): number[] {
        return this.getNumberLevelField("hcl2")
    }

    public set allyHealingPerDebuffRemoved(
        allyHealingPerDebuffRemoved: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hcl2", allyHealingPerDebuffRemoved)
    }

    /** Ally Buff Duration */
    public get allyBuffDuration(): number[] {
        return this.getNumberLevelField("hcl3")
    }

    public set allyBuffDuration(allyBuffDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hcl3", allyBuffDuration)
    }

    /** Ally Damage Bonus Percent Base */
    public get allyBaseDamageBonusPercentage(): number[] {
        return this.getNumberLevelField("hcl4")
    }

    public set allyBaseDamageBonusPercentage(
        allyBaseDamageBonusPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hcl4", allyBaseDamageBonusPercentage)
    }

    /** Ally Damage Bonus Percent Per Debuff Removed */
    public get allyDamageBonusPercentagePerDebuffRemoved(): number[] {
        return this.getNumberLevelField("hcl5")
    }

    public set allyDamageBonusPercentagePerDebuffRemoved(
        allyDamageBonusPercentagePerDebuffRemoved: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hcl5", allyDamageBonusPercentagePerDebuffRemoved)
    }

    /** Enemy Stun Duration */
    public get enemyStunDuration(): number[] {
        return this.getNumberLevelField("hcl6")
    }

    public set enemyStunDuration(
        enemyStunDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hcl6", enemyStunDuration)
    }

    /** Summoned Damage */
    public get summonedDamage(): number[] {
        return this.getNumberLevelField("hcl7")
    }

    public set summonedDamage(summonedDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hcl7", summonedDamage)
    }
}
