import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SpellVampAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIsv") as AbilityTypeId

    /** Spell Vamp */
    public get spellVamp(): number[] {
        return this.getNumberLevelField("Isv1")
    }

    public set spellVamp(spellVamp: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Isv1", spellVamp)
    }

    /** Flat Bonus */
    public get isFlatBonus(): boolean[] {
        return this.getBooleanLevelField("Isv2")
    }

    public set isFlatBonus(isFlatBonus: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Isv2", isFlatBonus)
    }
}
