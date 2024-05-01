import { AbilityType, AbilityTypeId } from "../ability-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class MineAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Amin") as AbilityTypeId

    public get activationDelay(): number[] {
        return this.getNumberLevelField("Min1")
    }

    public set activationDelay(activationDelay: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Min1", activationDelay)
    }

    public get invisibilityDelay(): number[] {
        return this.getNumberLevelField("Min2")
    }

    public set invisibilityDelay(
        invisibilityDelay: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Min2", invisibilityDelay)
    }
}
