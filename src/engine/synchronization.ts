import { Player } from "../core/types/player"
import { MAXIMUM_INTEGER, MINIMUM_INTEGER } from "../math"
import { LinkedSet } from "../utility/linked-set"
import { Event } from "../event"

const eventInvoke = Event.invoke

const createFrameByType = BlzCreateFrameByType
const createTrigger = CreateTrigger
const getOriginFrame = BlzGetOriginFrame
const getTriggerFrameValue = BlzGetTriggerFrameValue
const getTriggerPlayer = GetTriggerPlayer
const frameSetMinMaxValue = BlzFrameSetMinMaxValue
const frameSetValue = BlzFrameSetValue
const triggerAddAction = TriggerAddAction
const triggerRegisterFrameEvent = BlzTriggerRegisterFrameEvent

export const synchronizer = <T, K extends number>(
    getSyncId: (object: T) => K,
    getObject: (syncId: K) => T | undefined,
): ((player: Player, object: T | undefined) => Promise<T | undefined>) => {
    const queue = new LinkedSet<(object: T | undefined) => void>()
    const socket = new ObjectBus(getSyncId, getObject)
    socket.event.addListener((_, object) => {
        queue.pop()?.(object)
    })
    const executor: PromiseExecutor<T | undefined> = (resolve) => {
        queue.add(resolve)
    }
    return (player: Player, object: T | undefined) => {
        if (player.isLocal) {
            socket.send(object)
        }
        return new Promise(executor)
    }
}

export class ObjectBus<T, K extends number> {
    public readonly event: Event<[Player, T | undefined]>

    private readonly syncSlider: jframehandle

    public constructor(
        private readonly getSyncId: (object: T) => K,
        getObject: (syncId: K) => T | undefined,
    ) {
        const syncSlider = createFrameByType(
            "SLIDER",
            "Synchronizer",
            getOriginFrame(ORIGIN_FRAME_WORLD_FRAME, 0),
            "",
            0,
        )
        frameSetMinMaxValue(syncSlider, MINIMUM_INTEGER, MAXIMUM_INTEGER)
        this.syncSlider = syncSlider
        const event = new Event<[Player, T | undefined]>()
        const trigger = createTrigger()
        triggerRegisterFrameEvent(trigger, syncSlider, FRAMEEVENT_SLIDER_VALUE_CHANGED)
        triggerAddAction(trigger, () => {
            eventInvoke(
                event,
                Player.of(getTriggerPlayer()),
                getObject(getTriggerFrameValue() as K),
            )
        })
        this.event = event
    }

    public send(object: T | undefined): void {
        const syncId = object != undefined ? this.getSyncId(object) : 0
        frameSetValue(this.syncSlider, syncId)
    }
}
