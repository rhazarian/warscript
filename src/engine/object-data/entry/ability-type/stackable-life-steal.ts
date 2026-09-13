import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class StackableLifeStealAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIvx") as AbilityTypeId

    /** Life Stolen Per Attack */
    public get lifeStolenPerAttack(): number[] {
        return this.getNumberLevelField("Ivam")
    }

    public set lifeStolenPerAttack(
        lifeStolenPerAttack: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ivam", lifeStolenPerAttack)
    }
}
