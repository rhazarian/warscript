import { AbilityType, AbilityTypeId } from "../ability-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"
import { UnitTypeId } from "../unit-type"

export class RaiseDeadAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Arai") as AbilityTypeId

    public get firstSummonedUnitCount(): number[] {
        return this.getNumberLevelField("Rai1")
    }

    public set firstSummonedUnitCount(
        firstSummonedUnitCount: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Rai1", firstSummonedUnitCount)
    }

    public get secondSummonedUnitCount(): number[] {
        return this.getNumberLevelField("Rai2")
    }

    public set secondSummonedUnitCount(
        secondSummonedUnitCount: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Rai2", secondSummonedUnitCount)
    }

    public get firstSummonedUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryNumericIdLevelField("Rai3")
    }

    public set firstSummonedUnitTypeId(
        firstSummonedUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>,
    ) {
        this.setObjectDataEntryNumericIdLevelField("Rai3", firstSummonedUnitTypeId)
    }

    public get secondSummonedUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryNumericIdLevelField("Rai4")
    }

    public set secondSummonedUnitTypeId(
        secondSummonedUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>,
    ) {
        this.setObjectDataEntryNumericIdLevelField("Rai4", secondSummonedUnitTypeId)
    }

    public get limitCheckUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryNumericIdLevelField("Raiu")
    }

    public set limitCheckUnitTypeId(
        limitCheckUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>,
    ) {
        this.setObjectDataEntryNumericIdLevelField("Raiu", limitCheckUnitTypeId)
    }
}
