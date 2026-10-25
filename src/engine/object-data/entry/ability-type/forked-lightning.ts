import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Naga Sea Witch's Forked Lightning (`ANfl`): lightning in a cone; the target fields of Chain
 * Lightning (`Ocl*`) and the cone fields of Carrion Swarm (`Ucs3`, `Ucs4`).
 */
export class ForkedLightningAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANfl") as AbilityTypeId

    public get damagePerTarget(): number[] {
        return this.getNumberLevelField("Ocl1")
    }

    public set damagePerTarget(damagePerTarget: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ocl1", damagePerTarget)
    }

    public get targetCount(): number[] {
        return this.getNumberLevelField("Ocl2")
    }

    public set targetCount(targetCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ocl2", targetCount)
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
