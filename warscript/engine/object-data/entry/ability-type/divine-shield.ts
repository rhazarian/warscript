import { AbilityType, AbilityTypeId } from "../ability-type"

export class DivineShieldAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHds") as AbilityTypeId
}
