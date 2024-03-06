import { Player } from "../core/types/player"
import { Event } from "../event"

const eventInvoke = Event.invoke

const condition = Condition
const createTrigger = CreateTrigger
const triggerAddCondition = TriggerAddCondition
const triggerClearConditions = TriggerClearConditions
const destroyTrigger = DestroyTrigger
const getTriggerPlayer = GetTriggerPlayer
const triggerRegisterFrameEvent = BlzTriggerRegisterFrameEvent
const createFrameByType = BlzCreateFrameByType
const frameClick = BlzFrameClick
const destroyFrame = BlzDestroyFrame

const worldFrame = BlzGetOriginFrame(ORIGIN_FRAME_WORLD_FRAME, 0)

export class Signal {
    private readonly frame: jframehandle
    private readonly trigger: jtrigger

    public readonly onReceive: Event<[Player]>

    public constructor() {
        const frame = createFrameByType("BUTTON", "SignalButton", worldFrame, "", 0)
        const trigger = createTrigger()
        triggerRegisterFrameEvent(trigger, frame, FRAMEEVENT_CONTROL_CLICK)
        const onReceive = new Event<[Player]>()
        triggerAddCondition(
            trigger,
            condition(() => {
                eventInvoke(onReceive, Player.of(getTriggerPlayer()))
            })
        )
        this.frame = frame
        this.trigger = trigger
        this.onReceive = onReceive
    }

    public send(): void {
        frameClick(this.frame)
    }

    public destroy(): void {
        triggerClearConditions(this.trigger)
        destroyTrigger(this.trigger)
        destroyFrame(this.frame)
    }
}
