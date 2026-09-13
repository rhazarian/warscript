import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class HolyWrathAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHpb") as AbilityTypeId

    /** Damage */
    public get damage(): number[] {
        return this.getNumberLevelField("pbl1")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("pbl1", damage)
    }

    /** Attack Distance */
    public get attackDistance(): number[] {
        return this.getNumberLevelField("pbl2")
    }

    public set attackDistance(attackDistance: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("pbl2", attackDistance)
    }

    /** Attack Angle */
    public get attackAngle(): number[] {
        return this.getNumberLevelField("pbl3")
    }

    public set attackAngle(attackAngle: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("pbl3", attackAngle)
    }

    /** Damage Delay */
    public get damageDelay(): number[] {
        return this.getNumberLevelField("pbl4")
    }

    public set damageDelay(damageDelay: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("pbl4", damageDelay)
    }

    /** Damage Strength Modifier (%) */
    public get damageStrengthModifierPercentage(): number[] {
        return this.getNumberLevelField("pbl5")
    }

    public set damageStrengthModifierPercentage(
        damageStrengthModifierPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("pbl5", damageStrengthModifierPercentage)
    }

    /** Undead Burn Damage */
    public get undeadBurnDamage(): number[] {
        return this.getNumberLevelField("pbl6")
    }

    public set undeadBurnDamage(undeadBurnDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("pbl6", undeadBurnDamage)
    }

    /** Dispel Magic On Hit */
    public get dispelsMagicOnHit(): boolean[] {
        return this.getBooleanLevelField("pbl7")
    }

    public set dispelsMagicOnHit(
        dispelsMagicOnHit: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("pbl7", dispelsMagicOnHit)
    }

    /** Dispel Summoned Damage */
    public get dispelSummonedDamage(): number[] {
        return this.getNumberLevelField("pbl8")
    }

    public set dispelSummonedDamage(
        dispelSummonedDamage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("pbl8", dispelSummonedDamage)
    }
}
