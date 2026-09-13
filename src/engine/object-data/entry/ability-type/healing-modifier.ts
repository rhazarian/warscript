import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class HealingModifierAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Ahem") as AbilityTypeId

    /** % Healing Modifier */
    public get healingFactor(): number[] {
        return this.getNumberLevelField("hem1")
    }

    public set healingFactor(healingFactor: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hem1", healingFactor)
    }
}
