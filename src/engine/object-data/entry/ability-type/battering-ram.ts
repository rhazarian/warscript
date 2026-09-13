import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class BatteringRamAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUbr") as AbilityTypeId

    /** Target Intersect Radius */
    public get targetIntersectRadius(): number[] {
        return this.getNumberLevelField("chra")
    }

    public set targetIntersectRadius(
        targetIntersectRadius: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("chra", targetIntersectRadius)
    }

    /** Dash Speed */
    public get dashSpeed(): number[] {
        return this.getNumberLevelField("chr1")
    }

    public set dashSpeed(dashSpeed: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("chr1", dashSpeed)
    }

    /** Dash Damage */
    public get dashDamage(): number[] {
        return this.getNumberLevelField("chr2")
    }

    public set dashDamage(dashDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("chr2", dashDamage)
    }

    /** Bonus Critical Strike */
    public get bonusCriticalStrike(): number[] {
        return this.getNumberLevelField("chr3")
    }

    public set bonusCriticalStrike(
        bonusCriticalStrike: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("chr3", bonusCriticalStrike)
    }

    /** Remove Buffs On Ability Start */
    public get removesBuffsOnStart(): boolean[] {
        return this.getBooleanLevelField("chr6")
    }

    public set removesBuffsOnStart(
        removesBuffsOnStart: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("chr6", removesBuffsOnStart)
    }

    /** Bonus Damage */
    public get bonusDamage(): number[] {
        return this.getNumberLevelField("ubr1")
    }

    public set bonusDamage(bonusDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("ubr1", bonusDamage)
    }

    /** Bonus Damage Duration */
    public get bonusDamageDuration(): number[] {
        return this.getNumberLevelField("ubr2")
    }

    public set bonusDamageDuration(
        bonusDamageDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ubr2", bonusDamageDuration)
    }

    /** Max Charges */
    public get maximumCharges(): number[] {
        return this.getNumberLevelField("ubr3")
    }

    public set maximumCharges(maximumCharges: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("ubr3", maximumCharges)
    }

    /** Charges Regen Time */
    public get chargeRegenerationTime(): number[] {
        return this.getNumberLevelField("ubr4")
    }

    public set chargeRegenerationTime(
        chargeRegenerationTime: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("ubr4", chargeRegenerationTime)
    }
}
