import { AbilityTypeId } from "../ability-type"
import { StormBoltAbilityType } from "./storm-bolt"

/** Firelord's Firebolt (`ANfb`): a stunning missile; same damage field as Storm Bolt. */
export class FireboltAbilityType extends StormBoltAbilityType {
    public static override readonly BASE_ID = fourCC("ANfb") as AbilityTypeId
}
