import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class InspireCourageAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHic") as AbilityTypeId

    /** Defense */
    public get armorBonus(): number[] {
        return this.getNumberLevelField("hic1")
    }

    public set armorBonus(armorBonus: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hic1", armorBonus)
    }

    /** Spell Damage Resistance */
    public get spellDamageResistance(): number[] {
        return this.getNumberLevelField("hic2")
    }

    public set spellDamageResistance(
        spellDamageResistance: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hic2", spellDamageResistance)
    }

    /** Removes Negative Debuffs */
    public get removesNegativeBuffs(): boolean[] {
        return this.getBooleanLevelField("hic3")
    }

    public set removesNegativeBuffs(
        removesNegativeBuffs: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("hic3", removesNegativeBuffs)
    }

    /** Healing */
    public get healing(): number[] {
        return this.getNumberLevelField("hic4")
    }

    public set healing(healing: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hic4", healing)
    }
}
