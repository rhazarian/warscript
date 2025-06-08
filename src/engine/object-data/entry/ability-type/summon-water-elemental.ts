import { AbilityType, AbilityTypeId } from "../ability-type"
import { UnitTypeId } from "../unit-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SummonWaterElementalAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHwe") as AbilityTypeId

    public get summonedUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryNumericIdLevelField("Hwe1")
    }

    public set summonedUnitTypeId(
        summonedUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>,
    ) {
        this.setObjectDataEntryNumericIdLevelField("Hwe1", summonedUnitTypeId)
    }

    public get summonedUnitCount(): number[] {
        return this.getNumberLevelField("Hwe2")
    }

    public set summonedUnitCount(
        summonedUnitCount: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Hwe2", summonedUnitCount)
    }
}
