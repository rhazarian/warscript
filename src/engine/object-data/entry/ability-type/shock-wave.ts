import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ShockWaveAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AOsh") as AbilityTypeId

    public get damagePerTarget(): number[] {
        return this.getNumberLevelField("Osh1")
    }

    public set damagePerTarget(damagePerTarget: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Osh1", damagePerTarget)
    }

    public get maximumTotalDamage(): number[] {
        return this.getNumberLevelField("Osh2")
    }

    public set maximumTotalDamage(
        maximumTotalDamage: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Osh2", maximumTotalDamage)
    }
}
