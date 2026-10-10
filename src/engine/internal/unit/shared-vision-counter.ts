import { Unit } from "../unit"
import { Player } from "../../../core/types/player"

const unitShareVision = UnitShareVision

// UnitShareVision is a plain flag per unit and player: one source revoking it would take the
// vision away from every other source sharing the same unit with the same player.
const sharedVisionCounterByPlayerByUnit = setmetatable(new LuaMap<Unit, LuaMap<Player, number>>(), {
    __mode: "k",
})

declare module "../unit" {
    interface Unit {
        /**
         * Shares the vision of this unit with the player (`UnitShareVision`) until the matching
         * `decrementSharedVisionCounter`. The player sees the unit and what it sees; an invisible
         * unit stays invisible.
         */
        incrementSharedVisionCounter(player: Player): void
    }
}
Unit.prototype.incrementSharedVisionCounter = function (player) {
    let sharedVisionCounterByPlayer = sharedVisionCounterByPlayerByUnit.get(this)
    if (sharedVisionCounterByPlayer == undefined) {
        sharedVisionCounterByPlayer = new LuaMap()
        sharedVisionCounterByPlayerByUnit.set(this, sharedVisionCounterByPlayer)
    }
    const sharedVisionCounter = sharedVisionCounterByPlayer.get(player) ?? 0
    if (sharedVisionCounter == 0) {
        unitShareVision(this.handle, player.handle, true)
    }
    sharedVisionCounterByPlayer.set(player, sharedVisionCounter + 1)
}

declare module "../unit" {
    interface Unit {
        decrementSharedVisionCounter(player: Player): void
    }
}
Unit.prototype.decrementSharedVisionCounter = function (player) {
    const sharedVisionCounterByPlayer = sharedVisionCounterByPlayerByUnit.get(this)
    const sharedVisionCounter = sharedVisionCounterByPlayer?.get(player) ?? 0
    if (sharedVisionCounterByPlayer == undefined || sharedVisionCounter == 0) {
        return
    }
    if (sharedVisionCounter == 1) {
        unitShareVision(this.handle, player.handle, false)
        sharedVisionCounterByPlayer.delete(player)
    } else {
        sharedVisionCounterByPlayer.set(player, sharedVisionCounter - 1)
    }
}
