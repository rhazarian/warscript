import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class AutoAttackHealReductionEffectAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIf2") as AbilityTypeId

    public get healingFactor(): number[] {
        return this.getNumberLevelField("Iofr")
    }

    public set healingFactor(healingFactor: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Iofr", healingFactor)
    }

    public get autoAttackDamageIncrease(): number[] {
        return this.getNumberLevelField("Idam")
    }

    public set autoAttackDamageIncrease(
        autoAttackDamageIncrease: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Idam", autoAttackDamageIncrease)
    }

    public get enabledWeaponIndex(): number[] {
        return this.getNumberLevelField("Iob5")
    }

    public set enabledWeaponIndex(
        enabledWeaponIndex: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Iob5", enabledWeaponIndex)
    }
}
