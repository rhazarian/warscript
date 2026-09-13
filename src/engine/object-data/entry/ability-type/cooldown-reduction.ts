import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class CooldownReductionAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIcr") as AbilityTypeId

    /** Cooldown Reduction */
    public get cooldownReduction(): number[] {
        return this.getNumberLevelField("Icr1")
    }

    public set cooldownReduction(
        cooldownReduction: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Icr1", cooldownReduction)
    }

    /** Flat Bonus */
    public get isFlatBonus(): boolean[] {
        return this.getBooleanLevelField("Icr2")
    }

    public set isFlatBonus(isFlatBonus: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Icr2", isFlatBonus)
    }
}
