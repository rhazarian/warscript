import { AbilityType } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"
import { StandardAbilityTypeId } from "../../../standard/entries/ability-type"

export class ItemLifeRegenerationAbilityType extends AbilityType {
    public static override readonly BASE_ID = StandardAbilityTypeId.ITEM_LIFE_REGENERATION

    /** Hit Points Regenerated Per Second */
    public get healthRegeneration(): number[] {
        return this.getNumberLevelField("Ihpr")
    }

    public set healthRegeneration(
        healthRegeneration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ihpr", healthRegeneration)
    }
}
