import { AbilityType, AbilityTypeId } from "../ability-type"

export class InvulnerableAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Avul") as AbilityTypeId
}
