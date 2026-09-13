import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SacredAuraAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHas") as AbilityTypeId

    /** % Magic Resist Increase for Allies */
    public get allyMagicResistanceIncreaseFactor(): number[] {
        return this.getNumberLevelField("hsa1")
    }

    public set allyMagicResistanceIncreaseFactor(
        allyMagicResistanceIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsa1", allyMagicResistanceIncreaseFactor)
    }

    /** % Healing Increase for Allies */
    public get allyHealingIncreasePercentage(): number[] {
        return this.getNumberLevelField("hsa2")
    }

    public set allyHealingIncreasePercentage(
        allyHealingIncreasePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsa2", allyHealingIncreasePercentage)
    }

    /** % Cooldown Reduction Increase for Allies */
    public get allyCooldownReductionIncreaseFactor(): number[] {
        return this.getNumberLevelField("hsa3")
    }

    public set allyCooldownReductionIncreaseFactor(
        allyCooldownReductionIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsa3", allyCooldownReductionIncreaseFactor)
    }

    /** % Magic Resist Decrease for Enemies */
    public get enemyMagicResistanceDecreaseFactor(): number[] {
        return this.getNumberLevelField("hsa4")
    }

    public set enemyMagicResistanceDecreaseFactor(
        enemyMagicResistanceDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsa4", enemyMagicResistanceDecreaseFactor)
    }

    /** % Healing Decrease for Enemies */
    public get enemyHealingDecreaseFactor(): number[] {
        return this.getNumberLevelField("hsa5")
    }

    public set enemyHealingDecreaseFactor(
        enemyHealingDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsa5", enemyHealingDecreaseFactor)
    }

    /** % Cooldown Increase for Enemies */
    public get enemyCooldownIncreaseFactor(): number[] {
        return this.getNumberLevelField("hsa6")
    }

    public set enemyCooldownIncreaseFactor(
        enemyCooldownIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsa6", enemyCooldownIncreaseFactor)
    }

    /** Flat Mana Regen for Allies */
    public get allyFlatManaRegeneration(): number[] {
        return this.getNumberLevelField("hsa7")
    }

    public set allyFlatManaRegeneration(
        allyFlatManaRegeneration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsa7", allyFlatManaRegeneration)
    }
}
