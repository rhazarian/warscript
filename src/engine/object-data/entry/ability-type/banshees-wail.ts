import { AbilityType, AbilityTypeId } from "../ability-type"
import { UnitTypeId } from "../unit-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class BansheesWailAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUwc") as AbilityTypeId

    /** Number of Swarm Units */
    public get swarmUnitCount(): number[] {
        return this.getNumberLevelField("Uls1")
    }

    public set swarmUnitCount(swarmUnitCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Uls1", swarmUnitCount)
    }

    /** Unit Release Interval (seconds) */
    public get unitReleaseInterval(): number[] {
        return this.getNumberLevelField("Uls2")
    }

    public set unitReleaseInterval(
        unitReleaseInterval: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Uls2", unitReleaseInterval)
    }

    /** Max Swarm Units Per Target */
    public get maximumSwarmUnitsPerTarget(): number[] {
        return this.getNumberLevelField("Uls3")
    }

    public set maximumSwarmUnitsPerTarget(
        maximumSwarmUnitsPerTarget: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Uls3", maximumSwarmUnitsPerTarget)
    }

    /** Damage Return Factor */
    public get damageReturnFactor(): number[] {
        return this.getNumberLevelField("Uls4")
    }

    public set damageReturnFactor(
        damageReturnFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Uls4", damageReturnFactor)
    }

    /** Damage Return Threshold */
    public get damageReturnThreshold(): number[] {
        return this.getNumberLevelField("Uls5")
    }

    public set damageReturnThreshold(
        damageReturnThreshold: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Uls5", damageReturnThreshold)
    }

    /** Flat Mana Gain */
    public get flatManaGain(): number[] {
        return this.getNumberLevelField("bns6")
    }

    public set flatManaGain(flatManaGain: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("bns6", flatManaGain)
    }

    /** Healing Radius */
    public get healingRadius(): number[] {
        return this.getNumberLevelField("bns7")
    }

    public set healingRadius(healingRadius: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("bns7", healingRadius)
    }

    /** Swarm Unit Type */
    public get swarmUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryNumericIdLevelField("Ulsu")
    }

    public set swarmUnitTypeId(
        swarmUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>,
    ) {
        this.setObjectDataEntryNumericIdLevelField("Ulsu", swarmUnitTypeId)
    }
}
