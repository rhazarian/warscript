import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SpellAmpAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIap") as AbilityTypeId

    /** Spell Amp */
    public get spellAmp(): number[] {
        return this.getNumberLevelField("Isa1")
    }

    public set spellAmp(spellAmp: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Isa1", spellAmp)
    }

    /** Flat Bonus */
    public get isFlatBonus(): boolean[] {
        return this.getBooleanLevelField("Isa2")
    }

    public set isFlatBonus(isFlatBonus: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Isa2", isFlatBonus)
    }

    /** Applies to Healing from Items */
    public get appliesToItemHealing(): boolean[] {
        return this.getBooleanLevelField("Isa3")
    }

    public set appliesToItemHealing(
        appliesToItemHealing: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("Isa3", appliesToItemHealing)
    }
}
