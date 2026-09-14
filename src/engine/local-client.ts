import { Unit } from "../core/types/unit"
import { Async } from "../core/types/async"
import { Event, TriggerEvent } from "../event"
import { GraphicsMode } from "./index"
import { Frame } from "../core/types/frame"
import { Player } from "../core/types/player"
import { Timer } from "../core/types/timer"
import { Color } from "../core/types/color"
import { array } from "../utility/arrays"
import { Socket } from "../net/socket"

const frameToPixelX = BlzFrameToPixelX
const frameToPixelY = BlzFrameToPixelY
const getHandleId = GetHandleId
const getLocalClientHeight = BlzGetLocalClientHeight
const getLocalClientWidth = BlzGetLocalClientWidth
const getLocale = BlzGetLocale
const getMouseFocusUnit = BlzGetMouseFocusUnit
const getMouseScreenPosX = BlzGetMouseScreenPosX
const getMouseScreenPosY = BlzGetMouseScreenPosY
const getUnitRealField = BlzGetUnitRealField
const getUnitTypeId = GetUnitTypeId
const isHeroUnitId = IsHeroUnitId
const isKeyPressed = BlzIsKeyPressed
const isLocalClientActive = BlzIsLocalClientActive
const isMetaKeyPressed = BlzIsMetaKeyPressed
const isMouseButtonPressed = BlzIsMouseButtonPressed
const loadTOCFile = BlzLoadTOCFile
const location = Location
const pingMinimap = PingMinimap
const pingMinimapEx = PingMinimapEx
const pixelToFrameX = BlzPixelToFrameX
const pixelToFrameY = BlzPixelToFrameY

const tableSort = table.sort

const tocPath = "_warscript\\IsHD.toc"

compiletime(() => {
    if (currentMap) {
        const fdfPath = "_warscript\\IsHD.fdf"
        currentMap.addFileString(`_HD.w3mod\\${fdfPath}`, "\r\n")
        currentMap.addFileString(`_HD.w3mod\\${tocPath}`, `${fdfPath}\r\n`)
    }
})

const seenSmallSelectionLayoutSocket = new Socket()
const playersThatHaveSeenSmallSelectionLayout = new LuaSet<Player>()
let hasSeenSmallSelectionLayout = false
let haveAllPlayersSeenSmallSelectionLayout = false

seenSmallSelectionLayoutSocket.onMessage.addListener((player) => {
    playersThatHaveSeenSmallSelectionLayout.add(player)
})

const compensateSmallSelectionLayout = (buttonCount: number): void => {
    if (haveAllPlayersSeenSmallSelectionLayout) {
        return
    }
    haveAllPlayersSeenSmallSelectionLayout = true
    for (const player of Player.all) {
        if (
            player.isUser &&
            player.isPlaying &&
            !playersThatHaveSeenSmallSelectionLayout.has(player)
        ) {
            haveAllPlayersSeenSmallSelectionLayout = false
            break
        }
    }
    if (haveAllPlayersSeenSmallSelectionLayout) {
        return
    }
    if (buttonCount == 12 && !hasSeenSmallSelectionLayout) {
        hasSeenSmallSelectionLayout = true
        seenSmallSelectionLayoutSocket.send("")
    } else {
        // Until every player has seen the 12-button layout, reserve the same
        // 12 handles on every tick except the tick that first accesses it.
        for (let i = 0; i < 12; i++) {
            location(0, 0)
        }
    }
}

const localSelectedUnits: Unit[] = []
const indexByLocalSelectedUnit = new LuaMap<Unit, number>()

const compareUnitsSelectionPriority = (a: Unit, b: Unit): boolean => {
    const aHandle = a.handle
    const bHandle = b.handle

    const priorityDelta =
        getUnitRealField(bHandle, UNIT_RF_PRIORITY) - getUnitRealField(aHandle, UNIT_RF_PRIORITY)

    if (priorityDelta != 0) {
        return priorityDelta < 0
    }

    const aTypeId = getUnitTypeId(aHandle)
    const bTypeId = getUnitTypeId(bHandle)
    const orderDelta =
        (isHeroUnitId(aTypeId) ? getHandleId(aHandle) : aTypeId) -
        (isHeroUnitId(bTypeId) ? getHandleId(bHandle) : bTypeId)

    return (
        (orderDelta != 0
            ? orderDelta
            : indexByLocalSelectedUnit.get(a)! - indexByLocalSelectedUnit.get(b)!) < 0
    )
}

let mainSelectedUnitChangeEvent: Event<[Unit | undefined, Unit | undefined]>
let previousMainSelectedUnit: Unit | undefined
let currentMainSelectedUnit: Unit | undefined

let lastTargetingModeState = false
const targetingModeEnterEvent = new Event()
const targetingModeLeaveEvent = new Event()
const targetingModeStateChangeEvent = new Event()

export class LocalClient {
    private constructor() {
        // should not be instantiated
    }

    public static readonly locale = getLocale()

    public static get width(): number {
        return getLocalClientWidth()
    }

    public static get height(): number {
        return getLocalClientHeight()
    }

    public static get isHD(): boolean {
        return false
    }

    public static get graphicsMode(): GraphicsMode {
        return this.isHD ? GraphicsMode.HD : GraphicsMode.SD
    }

    public static get isActive(): boolean {
        return isLocalClientActive()
    }

    public static get isMinimized(): boolean {
        return getLocalClientHeight() == 0
    }

    public static pingMinimap(
        x: number,
        y: number,
        duration: number,
        ...parameters:
            | []
            | [red: number, green: number, blue: number, flashy?: boolean]
            | [color: Color, flashy?: boolean]
    ): void

    public static pingMinimap(
        x: number,
        y: number,
        duration: number,
        redOrColor?: number | Color,
        greenOrFlashy?: number | boolean,
        blue?: number,
        flashy?: boolean,
    ): void {
        if (redOrColor == undefined) {
            pingMinimap(x, y, duration)
        } else if (redOrColor instanceof Color) {
            pingMinimapEx(
                x,
                y,
                duration,
                redOrColor.r,
                redOrColor.g,
                redOrColor.b,
                (greenOrFlashy as boolean | undefined) || false,
            )
        } else {
            pingMinimapEx(
                x,
                y,
                duration,
                redOrColor,
                greenOrFlashy as number,
                blue as number,
                flashy || false,
            )
        }
    }

    /** Local input state; do not use to branch synchronized game logic. */
    public static isKeyPressed(key: joskeytype): boolean {
        return isKeyPressed(key)
    }

    /** Local input state. Uses the same modifier mask as Player key events. */
    public static isMetaKeyPressed(key: oskeymeta): boolean {
        return isMetaKeyPressed(key)
    }

    /** Local input state. */
    public static isMouseButtonPressed(button: jmousebuttontype): boolean {
        return isMouseButtonPressed(button)
    }

    public static get mouseScreenX(): number {
        return getMouseScreenPosX()
    }

    public static get mouseScreenY(): number {
        return getMouseScreenPosY()
    }

    public static screenToFrameX(x: number): number {
        return pixelToFrameX(x)
    }

    public static screenToFrameY(y: number): number {
        return pixelToFrameY(y)
    }

    public static frameToScreenX(x: number): number {
        return frameToPixelX(x)
    }

    public static frameToScreenY(y: number): number {
        return frameToPixelY(y)
    }

    public static get mouseFrameX(): number {
        return pixelToFrameX(getMouseScreenPosX())
    }

    public static get mouseFrameY(): number {
        return pixelToFrameY(getMouseScreenPosY())
    }

    public static get mouseFocusUnit(): Async<Unit> | undefined {
        return Unit.of(getMouseFocusUnit())
    }

    /** Local selection sampled every 1/64 second; undefined before the first tick. */
    public static get mainSelectedUnit(): Async<Unit> | undefined {
        return currentMainSelectedUnit
    }

    public static get mainSelectedUnitChangeEvent(): Event<
        [previousMainSelectedUnit: Unit | undefined, newMainSelectedUnit: Unit | undefined]
    > {
        if (mainSelectedUnitChangeEvent == undefined) {
            mainSelectedUnitChangeEvent = new Event()
        }
        return mainSelectedUnitChangeEvent
    }

    public static get isInTargetingMode(): boolean {
        return actualizeTargetingModeState()
    }

    public static readonly targetingModeEnterEvent = targetingModeEnterEvent

    public static readonly targetingModeLeaveEvent = targetingModeLeaveEvent

    public static readonly targetingModeStateChangeEvent = targetingModeStateChangeEvent

    public static readonly onDisconnect = new TriggerEvent(
        (trigger) => {
            TriggerRegisterGameStateEvent(trigger, GAME_STATE_DISCONNECTED, NOT_EQUAL, 0)
        },
        () => $multi(),
    )
}

const actualizeMainSelectedUnit = (): void => {
    Unit.getSelectionOf(Player.local, localSelectedUnits)

    for (const i of $range(1, localSelectedUnits.length)) {
        indexByLocalSelectedUnit.set(localSelectedUnits[i - 1], i)
    }

    tableSort(localSelectedUnits, compareUnitsSelectionPriority)

    // The default 24-button layout exists from initialization. The first
    // access to the 12-button layout is compensated on all other clients.
    // Re-resolve the current frames on every synchronized tick.
    const selectionButtons = Frame.byName("SimpleInfoPanelUnitDetail")
        .parent.getChild(5)
        .getChild(0)
    const buttonCount = selectionButtons.getChildrenCount()
    let mainSelectedUnitIndex: number | undefined
    let maxButtonWidth = 0
    for (const i of $range(0, buttonCount - 1)) {
        const width = selectionButtons.getChild(i).getChild(1).width
        if (width > maxButtonWidth) {
            maxButtonWidth = width
            mainSelectedUnitIndex = i
        }
    }
    compensateSmallSelectionLayout(buttonCount)

    const mainSelectedUnit =
        localSelectedUnits[localSelectedUnits.length > 1 ? (mainSelectedUnitIndex ?? 0) : 0]

    for (const i of $range(1, localSelectedUnits.length)) {
        indexByLocalSelectedUnit.delete(localSelectedUnits[i - 1])
        localSelectedUnits[i - 1] = undefined!
    }

    currentMainSelectedUnit = mainSelectedUnit

    if (mainSelectedUnitChangeEvent != undefined && mainSelectedUnit != previousMainSelectedUnit) {
        const previousPreviousMainSelectedUnit = previousMainSelectedUnit
        previousMainSelectedUnit = mainSelectedUnit
        Event.invoke(
            mainSelectedUnitChangeEvent,
            previousPreviousMainSelectedUnit,
            previousMainSelectedUnit,
        )
    }
}

const commandButtons = array(12, (i) => Frame.byOrigin(ORIGIN_FRAME_COMMAND_BUTTON, i))

const getTargetingModeState = (): boolean => {
    for (const i of $range(0, 10)) {
        if (commandButtons[i].visible) {
            return false
        }
    }
    return commandButtons[11].visible
}

const actualizeTargetingModeState = (): boolean => {
    if (getTargetingModeState()) {
        if (!lastTargetingModeState) {
            lastTargetingModeState = true
            Event.invoke(targetingModeEnterEvent)
            Event.invoke(targetingModeStateChangeEvent)
        }
        return true
    }
    if (lastTargetingModeState) {
        lastTargetingModeState = false
        Event.invoke(targetingModeLeaveEvent)
        Event.invoke(targetingModeStateChangeEvent)
    }
    return false
}

Timer.onPeriod[1 / 64].addListener(() => {
    actualizeMainSelectedUnit()
    actualizeTargetingModeState()
})

warpack.afterMapInit(() => {
    rawset(LocalClient, "isHD", loadTOCFile(tocPath))
})
