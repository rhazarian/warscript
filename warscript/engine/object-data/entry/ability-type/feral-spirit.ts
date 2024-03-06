import { AbilityType, AbilityTypeId } from "../ability-type"
import { UnitTypeId } from "../unit-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class FeralSpiritAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AOsf") as AbilityTypeId

    public get summonedUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryIdLevelField("Osf1")
    }

    public set summonedUnitTypeId(
        summonedUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>
    ) {
        this.setObjectDataEntryIdLevelField("Osf1", summonedUnitTypeId)
    }

    public get summonedUnitCount(): number[] {
        return this.getNumberLevelField("Osf2")
    }

    public set summonedUnitCount(
        summonedUnitCount: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Osf2", summonedUnitCount)
    }
}
