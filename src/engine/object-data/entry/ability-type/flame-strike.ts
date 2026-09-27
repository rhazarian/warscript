import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/** Blood Mage's Flame Strike (`AHfs`). */
export class FlameStrikeAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHfs") as AbilityTypeId

    /** Full Damage Dealt */
    public get fullDamageDealt(): number[] {
        return this.getNumberLevelField("Hfs1")
    }

    public set fullDamageDealt(fullDamageDealt: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hfs1", fullDamageDealt)
    }

    /** Full Damage Interval */
    public get fullDamageInterval(): number[] {
        return this.getNumberLevelField("Hfs2")
    }

    public set fullDamageInterval(
        fullDamageInterval: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Hfs2", fullDamageInterval)
    }

    /** Half Damage Dealt */
    public get halfDamageDealt(): number[] {
        return this.getNumberLevelField("Hfs3")
    }

    public set halfDamageDealt(halfDamageDealt: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hfs3", halfDamageDealt)
    }

    /** Half Damage Interval */
    public get halfDamageInterval(): number[] {
        return this.getNumberLevelField("Hfs4")
    }

    public set halfDamageInterval(
        halfDamageInterval: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Hfs4", halfDamageInterval)
    }

    /** Building Reduction */
    public get structureDamageDecreaseFactor(): number[] {
        return this.getNumberLevelField("Hfs5")
    }

    public set structureDamageDecreaseFactor(
        structureDamageDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Hfs5", structureDamageDecreaseFactor)
    }

    /** Maximum Damage */
    public get maximumDamage(): number[] {
        return this.getNumberLevelField("Hfs6")
    }

    public set maximumDamage(maximumDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hfs6", maximumDamage)
    }
}
