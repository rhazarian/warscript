import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SpellDamageReductionAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIsr") as AbilityTypeId

    public get autoAttackDamageIncrease(): number[] {
        return this.getNumberLevelField("isr1")
    }

    public set autoAttackDamageIncrease(
        autoAttackDamageIncrease: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("isr1", autoAttackDamageIncrease)
    }

    public get receivedSpellDamageDecreaseFactor(): number[] {
        return this.getNumberLevelField("isr2")
    }

    public set receivedSpellDamageDecreaseFactor(
        receivedSpellDamageDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("isr2", receivedSpellDamageDecreaseFactor)
    }
}
