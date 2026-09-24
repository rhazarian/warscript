import { AbilityType } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"
import { StandardAbilityTypeId } from "../../../standard/entries/ability-type"

export class AuraOfBlightAbilityType extends AbilityType {
    public static override readonly BASE_ID = StandardAbilityTypeId.AURA_OF_BLIGHT

    /** Amount of Hit Points Regenerated */
    public get healthRegeneration(): number[] {
        return this.getNumberLevelField("Oar1")
    }

    public set healthRegeneration(healthRegeneration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Oar1", healthRegeneration)
    }

    /** Percentage */
    public get isHealthRegenerationPercentage(): boolean[] {
        return this.getBooleanLevelField("Oar2")
    }

    public set isHealthRegenerationPercentage(
        isHealthRegenerationPercentage: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("Oar2", isHealthRegenerationPercentage)
    }
}
