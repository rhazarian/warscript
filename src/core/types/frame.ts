import { Handle, HandleDestructor } from "./handle"
import { Player } from "./player"
import { Event, TriggerEvent } from "../../event"
import { Timer } from "./timer"
import { Color } from "./color"

const frameClick = BlzFrameClick
const frameGetEnable = BlzFrameGetEnable
const frameIsVisible = BlzFrameIsVisible
const frameSetEnable = BlzFrameSetEnable
const frameSetScale = BlzFrameSetScale

const getCameraTargetPositionX = GetCameraTargetPositionX
const getCameraTargetPositionY = GetCameraTargetPositionY

const rawget = _G.rawget
const rawset = _G.rawset
const invoke = Event.invoke

type Collector<T extends any[]> = () => LuaMultiReturn<T>

class FrameEvent<T extends any[] = []> extends TriggerEvent<[Player, ...T]> {
    static readonly playerCollector: Collector<[Player]> = (): LuaMultiReturn<[Player]> => {
        return $multi(Player.of(GetTriggerPlayer()))
    }

    constructor(frame: Frame, eventType: jframeeventtype, c: Collector<[Player, ...T]>) {
        super((trigger) => BlzTriggerRegisterFrameEvent(trigger, frame.handle, eventType), c)
        frame.destroyEvent.addListener(() => {
            this.destroy()
        })
    }
}

type FrameSubclass<T extends Frame> = (new (frame: jframehandle) => T) & typeof Frame

const consoleUIBackdrop = BlzGetFrameByName("ConsoleUIBackdrop", 0)
const leftBorder = BlzCreateFrameByType("FRAME", "LeftBorderFrame", consoleUIBackdrop, "", 0)
const rightBorder = BlzCreateFrameByType("FRAME", "RightBorderFrame", consoleUIBackdrop, "", 0)
const updateBorders = () => {
    const w = BlzGetLocalClientWidth()
    const h = BlzGetLocalClientHeight()
    const width4by3 = (w - (h / 600) * 800) / 2
    const pxtodpi = 0.6 / h
    BlzFrameSetAbsPoint(leftBorder, FRAMEPOINT_TOPLEFT, -width4by3 * pxtodpi, 0.6)
    BlzFrameSetScale(leftBorder, 1)
    BlzFrameSetSize(leftBorder, 0.001, 0.6)
    BlzFrameSetAbsPoint(rightBorder, FRAMEPOINT_TOPRIGHT, (-width4by3 + w) * pxtodpi, 0.6)
    BlzFrameSetScale(rightBorder, 1)
    BlzFrameSetSize(rightBorder, 0.001, 0.6)
}

const worldFrame = BlzGetOriginFrame(ORIGIN_FRAME_WORLD_FRAME, 0)
const worldFrameTooltip = BlzCreateFrameByType("FRAME", "WorldFrameTooltip", worldFrame, "", 0)
BlzFrameSetTooltip(worldFrame, worldFrameTooltip)
const dummyButtonOn = BlzCreateFrameByType("BUTTON", "DummyButton", worldFrame, "", 0)
const dummyButtonOff = BlzCreateFrameByType("BUTTON", "DummyButton", worldFrame, "", 0)
const syncTrigger = CreateTrigger()
BlzTriggerRegisterFrameEvent(syncTrigger, dummyButtonOn, FRAMEEVENT_CONTROL_CLICK)
BlzTriggerRegisterFrameEvent(syncTrigger, dummyButtonOff, FRAMEEVENT_CONTROL_CLICK)
const isMouseOnZeroSync: Record<number, boolean | undefined> = {}
let isMouseOnWorld = BlzFrameIsVisible(worldFrameTooltip)
const isMouseOnWorldSync: Record<number, boolean | undefined> = {}
TriggerAddAction(syncTrigger, () => {
    isMouseOnWorldSync[GetPlayerId(GetTriggerPlayer())] = BlzGetTriggerFrame() == dummyButtonOn
})
Timer.onPeriod[1 / 64].addListener(() => {
    if (frameIsVisible(worldFrameTooltip) != isMouseOnWorld) {
        isMouseOnWorld = !isMouseOnWorld
        frameClick(isMouseOnWorld ? dummyButtonOn : dummyButtonOff)
    }
})

export type FramePoint = jframepointtype
export namespace FramePoint {
    export const TOP_LEFT: FramePoint = FRAMEPOINT_TOPLEFT
    export const TOP: FramePoint = FRAMEPOINT_TOP
    export const TOP_RIGHT: FramePoint = FRAMEPOINT_TOPRIGHT
    export const LEFT: FramePoint = FRAMEPOINT_LEFT
    export const CENTER: FramePoint = FRAMEPOINT_CENTER
    export const RIGHT: FramePoint = FRAMEPOINT_RIGHT
    export const BOTTOM_LEFT: FramePoint = FRAMEPOINT_BOTTOMLEFT
    export const BOTTOM: FramePoint = FRAMEPOINT_BOTTOM
    export const BOTTOM_RIGHT: FramePoint = FRAMEPOINT_BOTTOMRIGHT
}

export class Frame extends Handle<jframehandle> {
    public static readonly GAME_UI: Frame = Frame.byOrigin(ORIGIN_FRAME_GAME_UI)
    public static readonly CONSOLE_UI: Frame = Frame.byOrigin(ORIGIN_FRAME_SIMPLE_UI_PARENT)
    public static readonly CONSOLE_UI_BACKDROP: Frame = Frame.byName("ConsoleUIBackdrop")
    private static readonly CONSOLE_UI_BACKDROP_UI_SCALE_HELPER_CHILD: Frame = Frame.createByType(
        "FRAME",
        "ConsoleUIBackdropUIScaleHelperChild",
        Frame.CONSOLE_UI_BACKDROP,
    )
    public static readonly CONSOLE_TOP_BAR: Frame = Frame.byName("ConsoleTopBar")
    public static readonly CONSOLE_BOTTOM_BAR: Frame = Frame.byName("ConsoleBottomBar")
    public static readonly WORLD: Frame = Frame.byOrigin(ORIGIN_FRAME_WORLD_FRAME)
    public static readonly CHAT: Frame = Frame.byOrigin(ORIGIN_FRAME_CHAT_MSG)
    public static readonly TIME_OF_DAY_CLOCK = Frame.GAME_UI.getChild(5).getChild(0)

    public static get uiScale(): number {
        return Frame.CONSOLE_BOTTOM_BAR.width / 0.8
    }

    public static get leftBorder(): Frame {
        Timer.onPeriod[1 / 64].addListener(updateBorders)
        rawset(this, "leftBorder", leftBorderFrame)
        rawset(this, "rightBorder", rightBorderFrame)
        return leftBorderFrame
    }

    public static get rightBorder(): Frame {
        Timer.onPeriod[1 / 64].addListener(updateBorders)
        rawset(this, "leftBorder", leftBorderFrame)
        rawset(this, "rightBorder", rightBorderFrame)
        return rightBorderFrame
    }

    public static get minX(): number {
        const w = BlzGetLocalClientWidth()
        const h = BlzGetLocalClientHeight()
        const width4by3 = (w - (h / 600) * 800) / 2
        const pxtodpi = 0.6 / h
        return -width4by3 * pxtodpi
    }

    public static get maxX(): number {
        const w = BlzGetLocalClientWidth()
        const h = BlzGetLocalClientHeight()
        const width4by3 = (w - (h / 600) * 800) / 2
        const pxtodpi = 0.6 / h
        return (-width4by3 + w) * pxtodpi
    }

    public static readonly centerX: number = 0.4

    public static readonly minY: number = 0

    public static readonly maxY: number = 0.6

    public static readonly centerY: number = 0.3

    public static isMouseOnWorld(player?: Player): boolean {
        if (player) {
            return (isMouseOnWorldSync[player.id] || false) && !isMouseOnZeroSync[player.id]
        }
        return BlzFrameIsVisible(worldFrameTooltip) && !isMouseOnZeroSync[Player.local.id]
    }

    protected override onDestroy(): HandleDestructor {
        BlzDestroyFrame(this.handle)
        return super.onDestroy()
    }

    private events?: { [eventId: number]: Event<any> }

    private mouseInside?: { [playerId: number]: boolean }

    private hideCounter = 0
    private disableCounter = 0

    private _scale?: number

    private getEvent(eventType: jframeeventtype, c: void): FrameEvent
    private getEvent<T extends any[]>(eventType: jframeeventtype, c: Collector<T>): FrameEvent<T>

    private getEvent<T extends any[] | []>(eventType: jframeeventtype, c: any): FrameEvent<T> {
        this.events = this.events || {}
        const eventId = GetHandleId(eventType)
        if (!this.events[eventId]) {
            this.events[eventId] = new FrameEvent<T>(
                this,
                eventType,
                (c
                    ? () => $multi(Player.of(GetTriggerPlayer()), ...(c as Collector<T>)())
                    : FrameEvent.playerCollector) as unknown as Collector<[Player, ...T]>,
            )
        }
        return this.events[eventId] as FrameEvent<T>
    }

    get visible(): boolean {
        return BlzFrameIsVisible(this.handle)
    }

    set visible(visible: boolean) {
        BlzFrameSetVisible(this.handle, visible)
        this.hideCounter = visible ? 0 : 1
    }

    public get enabled(): boolean {
        return frameGetEnable(this.handle)
    }

    public set enabled(enabled: boolean) {
        if (frameGetEnable(this.handle) != enabled) {
            frameSetEnable(this.handle, enabled)
            if (enabled) {
                const onEnable = rawget(this, "onEnable")
                if (onEnable != undefined) {
                    invoke(onEnable)
                }
            } else {
                const onDisable = rawget(this, "onDisable")
                if (onDisable != undefined) {
                    invoke(onDisable)
                }
            }
        }
        this.disableCounter = enabled ? 0 : 1
    }

    get parent(): Frame {
        return Frame.of(BlzFrameGetParent(this.handle))
    }

    set parent(parent: Frame) {
        BlzFrameSetParent(this.handle, parent.handle)
    }

    get text(): string {
        return BlzFrameGetText(this.handle)
    }

    set text(text: string) {
        BlzFrameSetText(this.handle, text)
    }

    set textSizeLimit(size: number) {
        BlzFrameSetTextSizeLimit(this.handle, size)
    }

    get textSizeLimit(): number {
        return BlzFrameGetTextSizeLimit(this.handle)
    }

    set value(value: number) {
        BlzFrameSetValue(this.handle, value)
    }

    get value(): number {
        return BlzFrameGetValue(this.handle)
    }

    set height(height: number) {
        BlzFrameSetSize(this.handle, this.width, height)
    }

    get height(): number {
        return BlzFrameGetHeight(this.handle)
    }

    set width(width: number) {
        BlzFrameSetSize(this.handle, width, this.height)
    }

    get width(): number {
        return BlzFrameGetWidth(this.handle)
    }

    set alpha(alpha: number) {
        BlzFrameSetAlpha(this.handle, alpha)
    }

    get alpha(): number {
        return BlzFrameGetAlpha(this.handle)
    }

    public get scale(): number {
        return this._scale ?? 1
    }

    public set scale(v: number) {
        frameSetScale(this.handle, v)
        this._scale = v != 1 ? v : undefined
    }

    get name(): string {
        return BlzFrameGetName(this.handle)
    }

    get onClick(): Event<[Player]> {
        return this.getEvent(FRAMEEVENT_CONTROL_CLICK)
    }

    get onCheckboxChecked(): FrameEvent {
        return this.getEvent(FRAMEEVENT_CHECKBOX_CHECKED)
    }

    get onCheckboxUnchecked(): FrameEvent {
        return this.getEvent(FRAMEEVENT_CHECKBOX_UNCHECKED)
    }

    get onEnter(): FrameEvent {
        return this.getEvent(FRAMEEVENT_EDITBOX_ENTER)
    }

    get onMouseDoubleClick(): FrameEvent {
        return this.getEvent(FRAMEEVENT_MOUSE_DOUBLECLICK)
    }

    get onMouseDown(): Event<[Player, jmousebuttontype]> {
        /** Since {@link FRAMEEVENT_MOUSE_DOWN} is not working, we are simulating it. */
        this.events = this.events || {}
        const eventId = GetHandleId(FRAMEEVENT_MOUSE_DOWN)
        if (!this.events[eventId]) {
            const event = new Event<[Player, jmousebuttontype]>()
            this.mouseInside = {}
            this.onMouseEnter.addListener((player) => {
                this.mouseInside![player.id] = true
            })
            this.onMouseLeave.addListener((player) => {
                this.mouseInside![player.id] = false
            })
            Player.onMouseDown.addListener((player, button) => {
                if (this.mouseInside![player.id]) {
                    Event.invoke(event, player, button)
                }
            })
            this.events[eventId] = event
        }
        return this.events[eventId]
    }

    get onMouseEnter(): FrameEvent {
        return this.getEvent(FRAMEEVENT_MOUSE_ENTER)
    }

    get onMouseLeave(): FrameEvent {
        return this.getEvent(FRAMEEVENT_MOUSE_LEAVE)
    }

    get onMouseUp(): FrameEvent {
        return this.getEvent(FRAMEEVENT_MOUSE_UP)
    }

    get onMouseWheel(): FrameEvent<[number]> {
        return this.getEvent(FRAMEEVENT_MOUSE_WHEEL, () => $multi(BlzGetTriggerFrameValue() / 120))
    }

    public get popupMenuItemChangeEvent(): FrameEvent<
        [popupMenu: Frame, previousValue: number, newValue: number]
    > {
        let value = this.value
        return this.getEvent(FRAMEEVENT_POPUPMENU_ITEM_CHANGED, () => {
            const previousValue = value
            value = BlzGetTriggerFrameValue()
            return $multi(this as Frame, previousValue, value)
        })
    }

    public get valueChangeLocalEvent(): Event<
        [editBox: Frame, previousValue: number, newValue: number]
    > {
        const event = new Event<[Frame, number, number]>()
        let lastValue = this.value
        const listener = () => {
            if (this.value != lastValue) {
                const newValue = this.value
                Event.invoke(event, this, lastValue, newValue)
                lastValue = newValue
            }
        }
        Timer.onPeriod[1 / 64].addListener(listener)
        this.destroyEvent.addListener(() => {
            Timer.onPeriod[1 / 64].removeListener(listener)
        })
        rawset(this, "valueChangeLocalEvent", event)
        return event
    }

    get onSliderValueChanged(): FrameEvent<[number]> {
        return this.getEvent(FRAMEEVENT_SLIDER_VALUE_CHANGED, () =>
            $multi(BlzGetTriggerFrameValue()),
        )
    }

    get onEditBoxTextChange(): FrameEvent<[string]> {
        return this.getEvent(FRAMEEVENT_EDITBOX_TEXT_CHANGED, () =>
            $multi(BlzGetTriggerFrameText()),
        )
    }

    public get onEditBoxTextChangeLocal(): Event<
        [editBox: Frame, previousValue: string, newValue: string]
    > {
        const event = new Event<[Frame, string, string]>()
        let lastValue = this.text
        const listener = () => {
            if (this.text != lastValue) {
                const newValue = this.text
                Event.invoke(event, this, lastValue, newValue)
                lastValue = newValue
            }
        }
        Timer.onPeriod[1 / 64].addListener(listener)
        this.destroyEvent.addListener(() => {
            Timer.onPeriod[1 / 64].removeListener(listener)
        })
        rawset(this, "onEditBoxTextChangeLocal", event)
        return event
    }

    public get onEnable(): Event {
        const event = new Event()
        rawset(this, "onEnable", event)
        return event
    }

    public get onDisable(): Event {
        const event = new Event()
        rawset(this, "onDisable", event)
        return event
    }

    /** Increments the inner hide counter. The frame is hidden whenever the counter is above 0. */
    hide(): void {
        this.hideCounter++
        if (this.hideCounter > 0) {
            BlzFrameSetVisible(this.handle, false)
        }
    }

    /** Decrements the inner hide counter. The frame is shown whenever the counter is 0. */
    show(): void {
        this.hideCounter--
        if (this.hideCounter <= 0) {
            this.hideCounter = 0
            BlzFrameSetVisible(this.handle, true)
        }
    }

    /** Increments the inner disable counter. The frame is disabled whenever the counter is above 0. */
    public disable(): void {
        this.disableCounter++
        if (this.disableCounter > 0) {
            frameSetEnable(this.handle, false)
            const onDisable = rawget(this, "onDisable")
            if (onDisable != undefined) {
                invoke(onDisable)
            }
        }
    }

    /** Decrements the inner disable counter. The frame is hidden whenever the counter is 0. */
    public enable(): void {
        this.disableCounter--
        if (this.disableCounter <= 0) {
            this.disableCounter = 0
            frameSetEnable(this.handle, true)
            const onEnable = rawget(this, "onEnable")
            if (onEnable != undefined) {
                invoke(onEnable)
            }
        }
    }

    addText(text: string): void {
        BlzFrameAddText(this.handle, text)
    }

    clearAllPoints(): void {
        BlzFrameClearAllPoints(this.handle)
    }

    public get children(): Frame[] {
        const children: Frame[] = []
        for (const i of $range(0, this.getChildrenCount() - 1)) {
            children[i] = this.getChild(i)
        }
        return children
    }

    getChild(index: number): Frame {
        return Frame.of(BlzFrameGetChild(this.handle, index))
    }

    getChildrenCount(): number {
        return BlzFrameGetChildrenCount(this.handle)
    }

    setSize(width: number, height: number): void {
        BlzFrameSetSize(this.handle, width, height)
    }

    setPoint(
        point: jframepointtype,
        relative: Frame,
        relativePoint: jframepointtype,
        x: number,
        y: number,
    ): void {
        BlzFrameSetPoint(this.handle, point, relative.handle, relativePoint, x, y)
    }

    setAbsPoint(point: jframepointtype, x: number, y: number): void {
        BlzFrameSetAbsPoint(this.handle, point, x, y)
    }

    setAllPoints(other: Frame): void {
        BlzFrameSetAllPoints(this.handle, other.handle)
    }

    setFont(filename: string, height: number, flags: number): void {
        BlzFrameSetFont(this.handle, filename, height, flags)
    }

    setTexture(filename: string, flag: number, blend: boolean): void {
        BlzFrameSetTexture(this.handle, filename, flag, blend)
    }

    setTextAlignment(vert: jtextaligntype, horz: jtextaligntype): void {
        BlzFrameSetTextAlignment(this.handle, vert, horz)
    }

    setVertexColor(color: Color): void {
        BlzFrameSetVertexColor(this.handle, BlzConvertColor(color.a, color.r, color.g, color.b))
    }

    setTextColor(color: Color): void {
        BlzFrameSetTextColor(this.handle, BlzConvertColor(color.a, color.r, color.g, color.b))
    }

    setTooltip(tooltip: Frame): void {
        BlzFrameSetTooltip(this.handle, tooltip.handle)
    }

    setMinMaxValue(minValue: number, maxValue: number): void {
        BlzFrameSetMinMaxValue(this.handle, minValue, maxValue)
    }

    setStepSize(stepSize: number): void {
        BlzFrameSetStepSize(this.handle, stepSize)
    }

    setFocus(flag: boolean): void {
        BlzFrameSetFocus(this.handle, flag)
    }

    resetFocus(): void {
        if (BlzFrameGetEnable(this.handle)) {
            BlzFrameSetEnable(this.handle, false)
            BlzFrameSetEnable(this.handle, true)
        }
    }

    click(): void {
        BlzFrameClick(this.handle)
    }

    private static onKeyPressEvent?: Event<[Player, joskeytype, oskeymeta]>

    static get onKeyPress(): Event<[Player, joskeytype, oskeymeta]> {
        if (!this.onKeyPressEvent) {
            this.onKeyPressEvent = new TriggerEvent(
                (trigger) =>
                    Timer.simple(0, () => {
                        for (let oskey = 10; oskey < 255; ++oskey) {
                            for (let metakey = 0; metakey < 5; ++metakey) {
                                for (const player of Player.all) {
                                    BlzTriggerRegisterPlayerKeyEvent(
                                        trigger,
                                        player.handle,
                                        ConvertOsKeyType(oskey),
                                        metakey,
                                        true,
                                    )
                                }
                            }
                        }
                    }),
                () =>
                    $multi(
                        Player.of(GetTriggerPlayer()),
                        BlzGetTriggerPlayerKey(),
                        BlzGetTriggerPlayerMetaKey() as oskeymeta,
                    ),
            )
        }
        return this.onKeyPressEvent
    }

    private static onKeyReleaseEvent?: Event<[Player, joskeytype, oskeymeta]>

    static get onKeyRelease(): Event<[Player, joskeytype, oskeymeta]> {
        if (!this.onKeyReleaseEvent) {
            this.onKeyReleaseEvent = new TriggerEvent(
                (trigger) =>
                    Timer.simple(0, () => {
                        for (let oskey = 10; oskey < 255; ++oskey) {
                            for (let metakey = 0; metakey < 5; ++metakey) {
                                for (const player of Player.all) {
                                    BlzTriggerRegisterPlayerKeyEvent(
                                        trigger,
                                        player.handle,
                                        ConvertOsKeyType(oskey),
                                        metakey,
                                        false,
                                    )
                                }
                            }
                        }
                    }),
                () =>
                    $multi(
                        Player.of(GetTriggerPlayer()),
                        BlzGetTriggerPlayerKey(),
                        BlzGetTriggerPlayerMetaKey() as oskeymeta,
                    ),
            )
        }
        return this.onKeyReleaseEvent
    }

    public static get onMouseUp(): Event<[Player, jmousebuttontype, number, number]> {
        const event = new TriggerEvent(
            (trigger) =>
                Timer.simple(0, () => {
                    for (const player of Player.all) {
                        TriggerRegisterPlayerEvent(trigger, player.handle, EVENT_PLAYER_MOUSE_UP)
                    }
                }),
            () =>
                $multi(
                    Player.of(GetTriggerPlayer()),
                    BlzGetTriggerPlayerMouseButton(),
                    BlzGetTriggerPlayerMouseX(),
                    BlzGetTriggerPlayerMouseY(),
                ),
        )
        rawset(Frame, "onMouseUp", event)
        return event
    }

    private static onMouseDownEvent?: Event<[Player, jmousebuttontype, number, number]>

    public static get onMouseDown(): Event<[Player, jmousebuttontype, number, number]> {
        if (!this.onMouseDownEvent) {
            this.onMouseDownEvent = new TriggerEvent(
                (trigger) =>
                    Timer.simple(0, () => {
                        for (const player of Player.all) {
                            TriggerRegisterPlayerEvent(
                                trigger,
                                player.handle,
                                EVENT_PLAYER_MOUSE_DOWN,
                            )
                        }
                    }),
                () =>
                    $multi(
                        Player.of(GetTriggerPlayer()),
                        BlzGetTriggerPlayerMouseButton(),
                        BlzGetTriggerPlayerMouseX(),
                        BlzGetTriggerPlayerMouseY(),
                    ),
            )
        }
        return this.onMouseDownEvent
    }

    public static get onMouseMove(): Event<[player: Player, x: number, y: number]> {
        const event = new TriggerEvent(
            (trigger) =>
                Timer.simple(0, () => {
                    for (const player of Player.all) {
                        TriggerRegisterPlayerEvent(trigger, player.handle, EVENT_PLAYER_MOUSE_MOVE)
                    }
                }),
            () =>
                $multi(
                    Player.of(GetTriggerPlayer()),
                    BlzGetTriggerPlayerMouseX(),
                    BlzGetTriggerPlayerMouseY(),
                ),
        )
        rawset(Frame, "onMouseMove", event)
        return event
    }

    public static get onMouseMoveLocal(): Event<[x: number, y: number]> {
        const invoke = Event.invoke
        const event = new Event<[x: number, y: number]>()

        let syncX = 0
        let syncY = 0
        let syncCamX = getCameraTargetPositionX()
        let syncCamY = getCameraTargetPositionY()
        let lastX = syncX
        let lastY = syncY
        this.onMouseMove.addListener((player, x, y) => {
            if (player.isLocal) {
                syncX = x
                syncY = y
                syncCamX = getCameraTargetPositionX()
                syncCamY = getCameraTargetPositionY()
                lastX = x
                lastY = y
                invoke(event, x, y)
            }
        })
        Timer.onPeriod[1 / 64].addListener(() => {
            if (syncX == 0 && syncY == 0) {
                return
            }
            const x = syncX + (getCameraTargetPositionX() - syncCamX)
            const y = syncY + (getCameraTargetPositionY() - syncCamY)
            if (x != lastX || y != lastY) {
                lastX = x
                lastY = y
                invoke(event, x, y)
            }
        })

        rawset(Frame, "onMouseMoveLocal", event)
        return event
    }

    public static createSimple<T extends Frame>(
        this: FrameSubclass<T>,
        name: string,
        parent?: Frame,
        createContext?: number,
    ): T {
        return this.of<jframehandle, T>(
            BlzCreateSimpleFrame(
                name,
                parent ? parent.handle : BlzGetOriginFrame(ORIGIN_FRAME_SIMPLE_UI_PARENT, 0),
                createContext ?? 0,
            ),
        )
    }

    public static create<T extends Frame>(
        this: FrameSubclass<T>,
        name: string,
        parent: Frame,
        priority?: number,
        createContext?: number,
    ): T {
        if (parent == Frame.CONSOLE_UI_BACKDROP) {
            const helper = Frame.CONSOLE_UI_BACKDROP_UI_SCALE_HELPER_CHILD.handle
            BlzFrameSetScale(helper, 1)
            const frame = BlzCreateFrame(name, helper, priority ?? 0, createContext ?? 0)
            BlzFrameSetScale(helper, Frame.uiScale)
            BlzFrameSetParent(frame, Frame.CONSOLE_UI_BACKDROP.handle)
            return this.of<jframehandle, T>(frame)
        } else {
            return this.of<jframehandle, T>(
                BlzCreateFrame(name, parent.handle, priority ?? 0, createContext ?? 0),
            )
        }
    }

    public static createByType<T extends Frame>(
        this: FrameSubclass<T>,
        typeName:
            | "BACKDROP"
            | "BUTTON"
            | "CHATDISPLAY"
            | "CHECKBOX"
            | "CONTROL"
            | "DIALOG"
            | "EDITBOX"
            | "FRAME"
            | "GLUEBUTTON"
            | "GLUECHECKBOX"
            | "GLUETEXTBUTTON"
            | "HIGHLIGHT"
            | "LISTBOX"
            | "MENU"
            | "POPUPMENU"
            | "SCROLLBAR"
            | "SLIDER"
            | "TEXT"
            | "TEXTAREA"
            | "TEXTBUTTON",
        name: string,
        parent: Frame,
        inherits?: string,
        createContext?: number,
    ): T {
        return this.of<jframehandle, T>(
            BlzCreateFrameByType(typeName, name, parent.handle, inherits ?? "", createContext ?? 0),
        )
    }

    static byName<T extends Frame>(this: FrameSubclass<T>, name: string, context = 0): T {
        return this.of<jframehandle, T>(BlzGetFrameByName(name, context))
    }

    static byOrigin<T extends Frame>(
        this: FrameSubclass<T>,
        frameType: joriginframetype,
        index = 0,
    ): T {
        return this.of<jframehandle, T>(BlzGetOriginFrame(frameType, index))
    }
}

const leftBorderFrame = Frame.of(leftBorder)
const rightBorderFrame = Frame.of(rightBorder)
