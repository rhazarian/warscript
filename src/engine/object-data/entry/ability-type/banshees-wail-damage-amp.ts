import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Ability damage amplification applied by Banshee's Wail (Amda).
 */
export class BansheesWailDamageAmpAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Amda") as AbilityTypeId

    /** Bonus Magic Damage Factor */
    public get bonusMagicDamageFactor(): number[] {
        return this.getNumberLevelField("mda1")
    }

    public set bonusMagicDamageFactor(
        bonusMagicDamageFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("mda1", bonusMagicDamageFactor)
    }
}
