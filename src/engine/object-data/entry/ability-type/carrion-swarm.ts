import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class CarrionSwarmAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUcs") as AbilityTypeId

    public get damagePerTarget(): number[] {
        return this.getNumberLevelField("Ucs1")
    }

    public set damagePerTarget(damagePerTarget: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ucs1", damagePerTarget)
    }

    public get maximumTotalDamage(): number[] {
        return this.getNumberLevelField("Ucs2")
    }

    public set maximumTotalDamage(
        maximumTotalDamage: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ucs2", maximumTotalDamage)
    }

    public get distance(): number[] {
        return this.getNumberLevelField("Ucs3")
    }

    public set distance(distance: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ucs3", distance)
    }

    public get finalAreaOfEffect(): number[] {
        return this.getNumberLevelField("Ucs4")
    }

    public set finalAreaOfEffect(
        finalAreaOfEffect: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ucs4", finalAreaOfEffect)
    }
}
