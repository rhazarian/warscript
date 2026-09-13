import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class GritAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHgr") as AbilityTypeId

    /** Defense Increase */
    public get armorIncrease(): number[] {
        return this.getNumberLevelField("hgr1")
    }

    public set armorIncrease(armorIncrease: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hgr1", armorIncrease)
    }

    /** Defense Cap */
    public get armorCap(): number[] {
        return this.getNumberLevelField("hgr2")
    }

    public set armorCap(armorCap: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hgr2", armorCap)
    }

    /** Magic Resistance At Cap */
    public get magicResistanceAtCap(): number[] {
        return this.getNumberLevelField("hgr3")
    }

    public set magicResistanceAtCap(
        magicResistanceAtCap: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hgr3", magicResistanceAtCap)
    }

    /** Bonus Attack Damage Percent At Cap */
    public get bonusAttackDamagePercentageAtCap(): number[] {
        return this.getNumberLevelField("hgr4")
    }

    public set bonusAttackDamagePercentageAtCap(
        bonusAttackDamagePercentageAtCap: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hgr4", bonusAttackDamagePercentageAtCap)
    }
}
