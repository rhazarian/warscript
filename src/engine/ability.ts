import { AbilityTypeId } from "./object-data/entry/ability-type"
import { UnitAbility } from "./internal/ability"
import { Player } from "../core/types/player"
import { InstantDummyCaster } from "../core/dummy"

export const castAbility = (
    owner: Player,
    abilityTypeId: AbilityTypeId,
    ...args: [
        ...levelOrAbilityConsumer: [number] | [(ability: UnitAbility) => void] | [],
        x: number,
        y: number
    ]
): void => {
    InstantDummyCaster.getInstance().cast(owner, abilityTypeId, ...args)
}
