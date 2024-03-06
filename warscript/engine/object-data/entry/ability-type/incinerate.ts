import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class IncinerateAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANic") as AbilityTypeId

    public get multiplyingDamage(): number[] {
        return this.getNumberLevelField("Nic1")
    }

    public set multiplyingDamage(multiplyingDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nic1", multiplyingDamage)
    }

    public get fullDeathDamage(): number[] {
        return this.getNumberLevelField("Nic2")
    }

    public set fullDeathDamage(fullDeathDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nic2", fullDeathDamage)
    }

    public get fullDeathDamageArea(): number[] {
        return this.getNumberLevelField("Nic3")
    }

    public set fullDeathDamageArea(fullDeathDamageArea: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nic3", fullDeathDamageArea)
    }

    public get smallDeathDamage(): number[] {
        return this.getNumberLevelField("Nic4")
    }

    public set smallDeathDamage(smallDeathDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nic4", smallDeathDamage)
    }

    public get smallDeathDamageArea(): number[] {
        return this.getNumberLevelField("Nic5")
    }

    public set smallDeathDamageArea(
        smallDeathDamageArea: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Nic5", smallDeathDamageArea)
    }

    public get deathDamageDelay(): number[] {
        return this.getNumberLevelField("Nic6")
    }

    public set deathDamageDelay(deathDamageDelay: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nic6", deathDamageDelay)
    }
}
