import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class DamageIncreaseAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AItg") as AbilityTypeId

    public get autoAttackDamageIncrease(): number[] {
        return this.getNumberLevelField("Iatt")
    }

    public set autoAttackDamageIncrease(
        autoAttackDamageIncrease: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Iatt", autoAttackDamageIncrease)
    }
}
