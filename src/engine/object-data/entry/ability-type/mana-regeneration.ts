import { AbilityType, AbilityTypeId } from "../ability-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ManaRegenerationAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIrm") as AbilityTypeId

    public get manaRegenerationRateIncreaseFactor(): number[] {
        return this.getNumberLevelField("Imrp")
    }

    public set manaRegenerationRateIncreaseFactor(
        manaRegenerationRateIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Imrp", manaRegenerationRateIncreaseFactor)
    }
}
