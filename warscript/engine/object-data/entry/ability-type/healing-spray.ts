import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class HealingSprayAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANhs") as AbilityTypeId

    public get healingPerInterval(): number[] {
        return this.getNumberLevelField("Ncs1")
    }

    public set healingPerInterval(healingPerInterval: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ncs1", healingPerInterval)
    }

    public get healingInterval(): number[] {
        return this.getNumberLevelField("Ncs2")
    }

    public set healingInterval(healingInterval: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ncs2", healingInterval)
    }

    public get missileCount(): number[] {
        return this.getNumberLevelField("Ncs3")
    }

    public set missileCount(missileCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ncs3", missileCount)
    }

    public get maximumHealing(): number[] {
        return this.getNumberLevelField("Ncs4")
    }

    public set maximumHealing(maximumHealing: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ncs4", maximumHealing)
    }

    public get structureHealingFactor(): number[] {
        return this.getNumberLevelField("Ncs5")
    }

    public set structureHealingFactor(
        structureHealingFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ncs5", structureHealingFactor)
    }

    public get waveCount(): number[] {
        return this.getNumberLevelField("Nhs6")
    }

    public set waveCount(effectDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nhs6", effectDuration)
    }
}
