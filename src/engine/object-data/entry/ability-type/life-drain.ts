import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/** Dark Ranger's Life Drain (`ANdr`): a channeled drain of hit points and/or mana. */
export class LifeDrainAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANdr") as AbilityTypeId

    /** Hit Points Drained (per second) */
    public get hitPointsDrained(): number[] {
        return this.getNumberLevelField("Ndr1")
    }

    public set hitPointsDrained(hitPointsDrained: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ndr1", hitPointsDrained)
    }

    /** Mana Points Drained (per second) */
    public get manaPointsDrained(): number[] {
        return this.getNumberLevelField("Ndr2")
    }

    public set manaPointsDrained(
        manaPointsDrained: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ndr2", manaPointsDrained)
    }

    /** Drain Interval (seconds) */
    public get drainInterval(): number[] {
        return this.getNumberLevelField("Ndr3")
    }

    public set drainInterval(drainInterval: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ndr3", drainInterval)
    }

    /** Life Transferred Per Second */
    public get lifeTransferredPerSecond(): number[] {
        return this.getNumberLevelField("Ndr4")
    }

    public set lifeTransferredPerSecond(
        lifeTransferredPerSecond: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ndr4", lifeTransferredPerSecond)
    }

    /** Mana Transferred Per Second */
    public get manaTransferredPerSecond(): number[] {
        return this.getNumberLevelField("Ndr5")
    }

    public set manaTransferredPerSecond(
        manaTransferredPerSecond: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ndr5", manaTransferredPerSecond)
    }

    /** Bonus Life Factor */
    public get bonusLifeFactor(): number[] {
        return this.getNumberLevelField("Ndr6")
    }

    public set bonusLifeFactor(bonusLifeFactor: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ndr6", bonusLifeFactor)
    }

    /** Bonus Life Decay (the World Editor labels of Ndr7 and Ndr8 are swapped) */
    public get bonusLifeDecay(): number[] {
        return this.getNumberLevelField("Ndr7")
    }

    public set bonusLifeDecay(bonusLifeDecay: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ndr7", bonusLifeDecay)
    }

    /** Bonus Mana Factor */
    public get bonusManaFactor(): number[] {
        return this.getNumberLevelField("Ndr8")
    }

    public set bonusManaFactor(bonusManaFactor: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ndr8", bonusManaFactor)
    }

    /** Bonus Mana Decay */
    public get bonusManaDecay(): number[] {
        return this.getNumberLevelField("Ndr9")
    }

    public set bonusManaDecay(bonusManaDecay: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ndr9", bonusManaDecay)
    }

    /** Use Black Arrow Effect */
    public get usesBlackArrowEffect(): boolean[] {
        return this.getBooleanLevelField("NdrA")
    }

    public set usesBlackArrowEffect(
        usesBlackArrowEffect: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("NdrA", usesBlackArrowEffect)
    }
}
