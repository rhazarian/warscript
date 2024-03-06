import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class FrostNovaAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUfn") as AbilityTypeId

    public get damagePerTarget(): number[] {
        return this.getNumberLevelField("Ufn1")
    }

    public set damagePerTarget(damagePerTarget: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ufn1", damagePerTarget)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Ufn2")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ufn2", damage)
    }

    public get maximumTotalDamage(): number[] {
        return this.getNumberLevelField("Ufn5")
    }

    public set maximumTotalDamage(
        maximumTotalDamage: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ufn5", maximumTotalDamage)
    }
}
