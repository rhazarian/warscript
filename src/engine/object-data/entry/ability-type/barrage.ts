import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class BarrageAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aroc") as AbilityTypeId

    public get damagePerTarget(): number[] {
        return this.getNumberLevelField("Efk1")
    }

    public set damagePerTarget(damagePerTarget: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Efk1", damagePerTarget)
    }

    public get maximumTotalDamage(): number[] {
        return this.getNumberLevelField("Efk2")
    }

    public set maximumTotalDamage(
        maximumTotalDamage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Efk2", maximumTotalDamage)
    }

    public get maximumTargetCount(): number[] {
        return this.getNumberLevelField("Efk3")
    }

    public set maximumTargetCount(
        maximumTargetCount: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Efk3", maximumTargetCount)
    }
}
