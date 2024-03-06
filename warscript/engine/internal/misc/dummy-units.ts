import { checkNotNull } from "../../../utility/preconditions"

/** @internal For use by internal systems only. */
export const INVENTORY_DUMMY_NATIVE_UNIT = checkNotNull(
    CreateUnit(Player(bj_PLAYER_NEUTRAL_VICTIM), fourCC("Hpal"), 0, 0, 270)
)
ShowUnit(INVENTORY_DUMMY_NATIVE_UNIT, false)
