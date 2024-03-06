import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ClusterRocketsAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANcs") as AbilityTypeId

    public get damagePerTargetPerInterval(): number[] {
        return this.getNumberLevelField("Ncs1")
    }

    public set damagePerTargetPerInterval(
        damagePerTargetPerInterval: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ncs1", damagePerTargetPerInterval)
    }

    public get damageInterval(): number[] {
        return this.getNumberLevelField("Ncs2")
    }

    public set damageInterval(damageInterval: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ncs2", damageInterval)
    }

    public get missileCount(): number[] {
        return this.getNumberLevelField("Ncs3")
    }

    public set missileCount(missileCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ncs3", missileCount)
    }

    public get maximumTotalDamage(): number[] {
        return this.getNumberLevelField("Ncs4")
    }

    public set maximumTotalDamage(
        maximumTotalDamage: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ncs4", maximumTotalDamage)
    }

    public get structureDamageFactor(): number[] {
        return this.getNumberLevelField("Ncs5")
    }

    public set structureDamageFactor(
        structureDamageFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ncs5", structureDamageFactor)
    }

    public get effectDuration(): number[] {
        return this.getNumberLevelField("Ncs6")
    }

    public set effectDuration(effectDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ncs6", effectDuration)
    }
}
