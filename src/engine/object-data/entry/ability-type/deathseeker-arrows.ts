import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class DeathseekerArrowsAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUdb") as AbilityTypeId

    /** Flat Damage */
    public get flatDamage(): number[] {
        return this.getNumberLevelField("udb1")
    }

    public set flatDamage(flatDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("udb1", flatDamage)
    }

    /** Percent Damage */
    public get damagePercentage(): number[] {
        return this.getNumberLevelField("udb2")
    }

    public set damagePercentage(damagePercentage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("udb2", damagePercentage)
    }

    /** Stacks Required */
    public get stacksRequired(): number[] {
        return this.getNumberLevelField("udb3")
    }

    public set stacksRequired(stacksRequired: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("udb3", stacksRequired)
    }

    /** Bonus Attack Speed per Attack */
    public get bonusAttackSpeedPerAttack(): number[] {
        return this.getNumberLevelField("udb4")
    }

    public set bonusAttackSpeedPerAttack(
        bonusAttackSpeedPerAttack: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("udb4", bonusAttackSpeedPerAttack)
    }

    /** Max Attack Speed Stacks */
    public get maximumAttackSpeedStacks(): number[] {
        return this.getNumberLevelField("udb5")
    }

    public set maximumAttackSpeedStacks(
        maximumAttackSpeedStacks: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("udb5", maximumAttackSpeedStacks)
    }
}
