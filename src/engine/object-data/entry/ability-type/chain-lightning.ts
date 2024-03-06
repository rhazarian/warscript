import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ChainLightningAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AOcl") as AbilityTypeId

    public get damage(): number[] {
        return this.getNumberLevelField("Ocl1")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ocl1", damage)
    }

    public get targetCount(): number[] {
        return this.getNumberLevelField("Ocl2")
    }

    public set targetCount(targetCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ocl2", targetCount)
    }

    public get damageDecreaseFactor(): number[] {
        return this.getNumberLevelField("Ocl3")
    }

    public set damageDecreaseFactor(
        damageDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ocl3", damageDecreaseFactor)
    }
}
