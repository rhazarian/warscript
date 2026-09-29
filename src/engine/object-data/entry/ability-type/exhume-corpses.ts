import { AbilityType, AbilityTypeId } from "../ability-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"
import { UnitTypeId } from "../unit-type"

/** Meat Wagon's Exhume Corpses (`Aexh`). */
export class ExhumeCorpsesAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aexh") as AbilityTypeId

    /** Maximum Number of Corpses */
    public get maximumCorpseCount(): number[] {
        return this.getNumberLevelField("exh1")
    }

    public set maximumCorpseCount(
        maximumCorpseCount: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("exh1", maximumCorpseCount)
    }

    /** Unit Type */
    public get corpseUnitTypeId(): UnitTypeId[] {
        return this.getObjectDataEntryNumericIdLevelField("exhu")
    }

    public set corpseUnitTypeId(
        corpseUnitTypeId: ObjectDataEntryLevelFieldValueSupplier<UnitTypeId>,
    ) {
        this.setObjectDataEntryNumericIdLevelField("exhu", corpseUnitTypeId)
    }
}
