import { Player } from "../../../core/types/player"
import { MAXIMUM_INTEGER, MINIMUM_INTEGER } from "../../../math"
import { LocalClient } from "../../local-client"
import { Unit, UnitSyncId } from "../unit"
import { Event } from "../../../event"

declare module "../unit" {
    namespace Unit {
        const mainSelectedUnitChangeEvent: Event<[Player]>
    }
}
const mainSelectedUnitChangeEvent = new Event<[Player]>()
rawset(Unit, "mainSelectedUnitChangeEvent", mainSelectedUnitChangeEvent)

const mainSelectedUnitByPlayer = new LuaMap<Player, Unit | undefined>()

const syncSlider = BlzCreateFrameByType(
    "SLIDER",
    "UnitSyncId",
    BlzGetOriginFrame(ORIGIN_FRAME_WORLD_FRAME, 0),
    "",
    0,
)
BlzFrameSetMinMaxValue(syncSlider, MINIMUM_INTEGER, MAXIMUM_INTEGER)
LocalClient.mainSelectedUnitChangeEvent.addListener(() => {
    const syncId = (LocalClient.mainSelectedUnit as Unit | undefined)?.syncId
    BlzFrameSetValue(syncSlider, syncId ?? 0)
})
const trg = CreateTrigger()
BlzTriggerRegisterFrameEvent(trg, syncSlider, FRAMEEVENT_SLIDER_VALUE_CHANGED)
TriggerAddAction(trg, () => {
    const player = Player.of(GetTriggerPlayer())
    const mainSelectedUnit = Unit.getBySyncId(BlzGetTriggerFrameValue() as UnitSyncId)
    if (mainSelectedUnit != mainSelectedUnitByPlayer.get(player)) {
        mainSelectedUnitByPlayer.set(player, mainSelectedUnit)
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
