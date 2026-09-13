import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class UnyieldingGuardAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHbd") as AbilityTypeId

    /** % Damage Reduction */
    public get damageReductionPercentage(): number[] {
        return this.getNumberLevelField("bld1")
    }

    public set damageReductionPercentage(
        damageReductionPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("bld1", damageReductionPercentage)
    }

    /** % Movement Speed reduction */
    public get movementSpeedReductionPercentage(): number[] {
        return this.getNumberLevelField("bld2")
    }

    public set movementSpeedReductionPercentage(
        movementSpeedReductionPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("bld2", movementSpeedReductionPercentage)
    }

    /** % Attack Speed Increase */
    public get attackSpeedIncreasePercentage(): number[] {
        return this.getNumberLevelField("bld3")
    }

    public set attackSpeedIncreasePercentage(
        attackSpeedIncreasePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("bld3", attackSpeedIncreasePercentage)
    }

    /** On Damage Taken Bonus Duration */
    public get bonusDurationOnDamageTaken(): number[] {
        return this.getNumberLevelField("bld4")
    }

    public set bonusDurationOnDamageTaken(
        bonusDurationOnDamageTaken: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("bld4", bonusDurationOnDamageTaken)
    }

    /** Sweep Remaining Cooldown Reduction On Hit */
    public get sweepCooldownReductionOnHit(): number[] {
        return this.getNumberLevelField("bld5")
    }

    public set sweepCooldownReductionOnHit(
        sweepCooldownReductionOnHit: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("bld5", sweepCooldownReductionOnHit)
    }

    /** % Damage Reflection */
    public get damageReflectionPercentage(): number[] {
        return this.getNumberLevelField("bld6")
    }

    public set damageReflectionPercentage(
        damageReflectionPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("bld6", damageReflectionPercentage)
    }

    /** Flat Damage Reflection */
    public get flatDamageReflection(): number[] {
        return this.getNumberLevelField("bld7")
    }

    public set flatDamageReflection(
        flatDamageReflection: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("bld7", flatDamageReflection)
    }

    /** % Ability Speed Increase */
    public get abilitySpeedIncreasePercentage(): number[] {
        return this.getNumberLevelField("bld8")
    }

    public set abilitySpeedIncreasePercentage(
        abilitySpeedIncreasePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("bld8", abilitySpeedIncreasePercentage)
    }
}
