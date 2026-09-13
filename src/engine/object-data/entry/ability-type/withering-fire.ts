import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class WitheringFireAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUwf") as AbilityTypeId

    /** Max Charges */
    public get maximumCharges(): number[] {
        return this.getNumberLevelField("uwf1")
    }

    public set maximumCharges(maximumCharges: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("uwf1", maximumCharges)
    }

    /** Charge Regen Time */
    public get chargeRegenerationTime(): number[] {
        return this.getNumberLevelField("uwf2")
    }

    public set chargeRegenerationTime(
        chargeRegenerationTime: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uwf2", chargeRegenerationTime)
    }

    /** Damage */
    public get damage(): number[] {
        return this.getNumberLevelField("uwf3")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("uwf3", damage)
    }

    /** Target Armor Reduction */
    public get targetArmorReduction(): number[] {
        return this.getNumberLevelField("uwf4")
    }

    public set targetArmorReduction(
        targetArmorReduction: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uwf4", targetArmorReduction)
    }

    /** Cooldown Reduction On Auto Attack */
    public get cooldownReductionOnAutoAttack(): number[] {
        return this.getNumberLevelField("uwf5")
    }

    public set cooldownReductionOnAutoAttack(
        cooldownReductionOnAutoAttack: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("uwf5", cooldownReductionOnAutoAttack)
    }
}
