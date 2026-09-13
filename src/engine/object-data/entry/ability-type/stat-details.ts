import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Stat details (ASde). Values are stat modifier ids from `abilitystatmodifiers.txt` (e.g. "AS01").
 */
export class StatDetailsAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ASde") as AbilityTypeId

    /** Supported stat modifiers */
    public get supportedStatModifierIds(): string[][] {
        return this.getStringsLevelField("Asdf")
    }

    public set supportedStatModifierIds(
        supportedStatModifierIds: ObjectDataEntryLevelFieldValueSupplier<string[]>,
    ) {
        this.setStringsLevelField("Asdf", supportedStatModifierIds)
    }
}
