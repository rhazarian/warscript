import { AbilityTypeId } from "../ability-type"
import { BlizzardAbilityType } from "./blizzard"

/** Pit Lord's Rain of Fire (`ANrf`): waves of fire; the same fields as Blizzard (`Hbz*`). */
export class RainOfFireAbilityType extends BlizzardAbilityType {
    public static override readonly BASE_ID = fourCC("ANrf") as AbilityTypeId
}
