import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class RighteousFuryAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANcp") as AbilityTypeId

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

    /** Normal - Bonus Critical Strike Duration */
    public get bonusCriticalStrikeDuration(): number[] {
        return this.getNumberLevelField("chr4")
    }

    public set bonusCriticalStrikeDuration(
        bonusCriticalStrikeDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("chr4", bonusCriticalStrikeDuration)
    }

    /** Hero - Bonus Critical Strike Duration */
    public get bonusCriticalStrikeHeroDuration(): number[] {
        return this.getNumberLevelField("chr5")
    }

    public set bonusCriticalStrikeHeroDuration(
        bonusCriticalStrikeHeroDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("chr5", bonusCriticalStrikeHeroDuration)
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

    /** Movement Speed Slow */
    public get movementSpeedSlowFactor(): number[] {
        return this.getNumberLevelField("nrf3")
    }

    public set movementSpeedSlowFactor(
        movementSpeedSlowFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("nrf3", movementSpeedSlowFactor)
    }

    /** Attack Speed Slow */
    public get attackSpeedSlowFactor(): number[] {
        return this.getNumberLevelField("nrf4")
    }

    public set attackSpeedSlowFactor(
        attackSpeedSlowFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("nrf4", attackSpeedSlowFactor)
    }
}
