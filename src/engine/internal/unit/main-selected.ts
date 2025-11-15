import { Player } from "../../../core/types/player"
import { LocalClient } from "../../local-client"
import { Unit, UnitSyncId } from "../unit"
import { Event } from "../../../event"
import { ObjectBus } from "../../synchronization"

declare module "../unit" {
    namespace Unit {
        const mainSelectedUnitChangeEvent: Event<[Player]>
    }
}
const mainSelectedUnitChangeEvent = new Event<[Player]>()
rawset(Unit, "mainSelectedUnitChangeEvent", mainSelectedUnitChangeEvent)

const mainSelectedUnitByPlayer = new LuaMap<Player, Unit | undefined>()

const unitBus = new ObjectBus<Unit, UnitSyncId>(
    (unit) => unit.syncId,
    (syncId) => Unit.getBySyncId(syncId),
)
LocalClient.mainSelectedUnitChangeEvent.addListener(() => {
    unitBus.send(LocalClient.mainSelectedUnit as Unit | undefined)
})
unitBus.event.addListener((player, unit) => {
    if (unit != mainSelectedUnitByPlayer.get(player)) {
        mainSelectedUnitByPlayer.set(player, unit)
        Event.invoke(mainSelectedUnitChangeEvent, player)
    }
})

declare module "../unit" {
    namespace Unit {
        const getMainSelectedOf: (player: Player) => Unit | undefined
    }
}
rawset(Unit, "getMainSelectedOf", (player: Player): Unit | undefined => {
    return mainSelectedUnitByPlayer.get(player)
})
