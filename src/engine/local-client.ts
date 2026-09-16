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

const frameGetChild = BlzFrameGetChild
const frameGetChildrenCount = BlzFrameGetChildrenCount
const frameGetParent = BlzFrameGetParent
const frameGetWidth = BlzFrameGetWidth
const frameToPixelX = BlzFrameToPixelX
const frameToPixelY = BlzFrameToPixelY
const getFrameByName = BlzGetFrameByName
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

const hdTocPath = "_warscript\\IsHD.toc"
const deTocPath = "_warscript\\IsDE.toc"

compiletime(() => {
    if (currentMap) {
        const hdFdfPath = "_warscript\\IsHD.fdf"
        currentMap.addFileString(`_HD.w3mod\\${hdFdfPath}`, "\r\n")
        currentMap.addFileString(`_HD.w3mod\\${hdTocPath}`, `${hdFdfPath}\r\n`)
        const deFdfPath = "_warscript\\IsDE.fdf"
        currentMap.addFileString(`_DE.w3mod\\${deFdfPath}`, "\r\n")
        currentMap.addFileString(`_DE.w3mod\\${deTocPath}`, `${deFdfPath}\r\n`)
    }
})

const SELECTION_DETAIL_FRAME_NAME = "SimpleInfoPanelUnitDetail"
const SELECTION_GROUP_PANEL_INDEX = 5
const SELECTION_BUTTON_ICON_INDEX = 1
/** The detail panel, its parent, the group panel and the button grid. */
const SELECTION_LAYOUT_ROOT_HANDLE_COUNT = 4
const SELECTION_LAYOUT_MAX_BUTTON_COUNT = 24
/** The root frames plus a button and its icon per slot of the largest layout. */
const SELECTION_LAYOUT_MAX_HANDLE_COUNT =
    SELECTION_LAYOUT_ROOT_HANDLE_COUNT + 2 * SELECTION_LAYOUT_MAX_BUTTON_COUNT
/** Registration requests for one local selection before giving up on its layout. */
const SELECTION_LAYOUT_MAX_REQUEST_COUNT = 8
/** Polling ticks between two registration requests for the same selection. */
const SELECTION_LAYOUT_REQUEST_INTERVAL = 16

// The frames registered for the current local selection. The polling reads these
// handles only; it never asks the game for a child frame, since a child created since
// the registration would receive a new handle id on this client alone.
let registeredSelectionGrid: jframehandle | undefined
let registeredSelectionButtonCount = 0
const registeredSelectionButtons: jframehandle[] = []
const registeredSelectionButtonChildCounts: number[] = []
const registeredSelectionIcons: jframehandle[] = []

/**
 * The index of the widest (highlighted) button among the registered ones. The first value
 * is false when the layout no longer matches the registration: the grid or a button has a
 * different number of children, or an icon reads as zero width, which a destroyed frame does.
 */
const getRegisteredMainSelectedUnitIndex = (): LuaMultiReturn<[boolean, number]> => {
    const grid = registeredSelectionGrid
    if (grid == undefined || frameGetChildrenCount(grid) != registeredSelectionButtonCount) {
        return $multi(false, 0)
    }
    let mainSelectedUnitIndex = 0
    let maxButtonWidth = 0
    for (const i of $range(0, registeredSelectionButtonCount - 1)) {
        if (
            frameGetChildrenCount(registeredSelectionButtons[i]) !=
            registeredSelectionButtonChildCounts[i]
        ) {
            return $multi(false, 0)
        }
        const width = frameGetWidth(registeredSelectionIcons[i])
        if (width <= 0) {
            return $multi(false, 0)
        }
        if (width > maxButtonWidth) {
            maxButtonWidth = width
            mainSelectedUnitIndex = i
        }
    }
    return $multi(true, mainSelectedUnitIndex)
}
const getChildIfPresent = (
    parent: jframehandle | undefined,
    index: number,
): jframehandle | undefined => {
    if (parent == undefined || index >= frameGetChildrenCount(parent)) {
        return undefined
    }
    return frameGetChild(parent, index)
}

const padSelectionLayoutFrames = (registeredCount: number): void => {
    for (let i = registeredCount; i < SELECTION_LAYOUT_MAX_HANDLE_COUNT; i++) {
        location(0, 0)
    }
}

/**
 * Wraps every frame of the group selection layout currently shown on this client, in the
 * order `actualizeMainSelectedUnit` later walks them. Game-owned frames receive a JASS handle
 * id the first time a script retrieves them, and the game builds the layout's buttons anew
 * whenever the selection changes, so this must run in a tick every client shares and register
 * the same number of handles everywhere: every frame reached for the first time counts, and
 * the remainder up to SELECTION_LAYOUT_MAX_HANDLE_COUNT is padded with locations, the way
 * `Frame.byOrigin` balances origin frames that appear asynchronously.
 *
 * Returns the number of buttons found, or undefined when the layout was not fully reachable.
 */
const registerShownSelectionLayoutFrames = (): number | undefined => {
    let registeredCount = 0
    const register = (handle: jframehandle | undefined): jframehandle | undefined => {
        if (handle == undefined || getHandleId(handle) == 0) {
            return undefined
        }
        if (!Frame.isWrapped(handle)) {
            registeredCount++
        }
        Frame.of<jframehandle, Frame>(handle)
        return handle
    }
    const detail = register(getFrameByName(SELECTION_DETAIL_FRAME_NAME, 0))
    const container = register(detail != undefined ? frameGetParent(detail) : undefined)
    const groupPanel = register(getChildIfPresent(container, SELECTION_GROUP_PANEL_INDEX))
    const grid = register(getChildIfPresent(groupPanel, 0))
    registeredSelectionGrid = grid
    let buttonCount: number | undefined
    if (grid != undefined) {
        const count = frameGetChildrenCount(grid)
        if (count <= SELECTION_LAYOUT_MAX_BUTTON_COUNT) {
            buttonCount = count
            for (const i of $range(0, count - 1)) {
                const button = register(getChildIfPresent(grid, i))
                const icon = register(getChildIfPresent(button, SELECTION_BUTTON_ICON_INDEX))
                if (button == undefined || icon == undefined) {
                    buttonCount = undefined
                } else {
                    registeredSelectionButtons[i] = button
                    registeredSelectionButtonChildCounts[i] = frameGetChildrenCount(button)
                    registeredSelectionIcons[i] = icon
                }
            }
        }
    }
    padSelectionLayoutFrames(registeredCount)
    return buttonCount
}

const getExpectedSelectionLayoutButtonCount = (selectionCount: number): number => {
    return selectionCount <= 12 ? 12 : SELECTION_LAYOUT_MAX_BUTTON_COUNT
}

// Every change of the local selection may rebuild the group panel's buttons, so the
// polling reads them only after they were registered for that very selection. A change
// bumps the epoch; a request over the socket makes every client allocate in the same
// tick, the requester by wrapping its frames, the others with locations only.
const selectionLayoutSocket = new Socket()
let localSelectionSignature = 0
let localSelectionEpoch = 0
let localSelectionCount = 0
let registeredSelectionEpoch = 0
let selectionLayoutRequestCount = 0
let selectionLayoutRequestPending = false
let selectionLayoutPollTick = 0
let selectionLayoutRequestTick = -SELECTION_LAYOUT_REQUEST_INTERVAL

selectionLayoutSocket.onMessage.addListener((player) => {
    if (player != Player.local) {
        padSelectionLayoutFrames(0)
        return
    }
    selectionLayoutRequestPending = false
    const buttonCount = registerShownSelectionLayoutFrames()
    // The layout shown now belongs to the current selection, which may be a later one
    // than the request was made for; the polling needs exactly the current one.
    if (
        buttonCount != undefined &&
        localSelectionCount > 1 &&
        buttonCount == getExpectedSelectionLayoutButtonCount(localSelectionCount)
    ) {
        registeredSelectionEpoch = localSelectionEpoch
        registeredSelectionButtonCount = buttonCount
    }
})

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

    public static get isSD(): boolean {
        return true
    }

    public static get isHD(): boolean {
        return false
    }

    public static get isDE(): boolean {
        return false
    }

    public static get graphicsMode(): GraphicsMode {
        return GraphicsMode.SD
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

    /**
     * Local selection sampled every 1/64 second. Undefined before the first tick and while
     * a group selection's buttons are not registered yet (see `selectionLayoutSocket`).
     */
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

    const selectionCount = localSelectedUnits.length
    let signature = selectionCount
    for (const i of $range(1, selectionCount)) {
        indexByLocalSelectedUnit.set(localSelectedUnits[i - 1], i)
        signature += getHandleId(localSelectedUnits[i - 1].handle)
    }
    selectionLayoutPollTick++
    if (signature != localSelectionSignature) {
        localSelectionSignature = signature
        localSelectionEpoch++
        selectionLayoutRequestCount = 0
        selectionLayoutRequestTick = -SELECTION_LAYOUT_REQUEST_INTERVAL
    }
    localSelectionCount = selectionCount

    tableSort(localSelectedUnits, compareUnitsSelectionPriority)

    let mainSelectedUnitIndex: number | undefined
    if (selectionCount > 1) {
        let registered = registeredSelectionEpoch == localSelectionEpoch
        if (registered) {
            const [intact, index] = getRegisteredMainSelectedUnitIndex()
            if (intact) {
                mainSelectedUnitIndex = index
            } else {
                // The game changed the panel underneath (a rebuilt or inserted frame);
                // register again rather than touch what it created.
                registered = false
                registeredSelectionEpoch = 0
            }
        }
        if (
            !registered &&
            !selectionLayoutRequestPending &&
            selectionLayoutRequestCount < SELECTION_LAYOUT_MAX_REQUEST_COUNT &&
            selectionLayoutPollTick - selectionLayoutRequestTick >=
                SELECTION_LAYOUT_REQUEST_INTERVAL
        ) {
            selectionLayoutRequestPending = true
            selectionLayoutRequestCount++
            selectionLayoutRequestTick = selectionLayoutPollTick
            selectionLayoutSocket.send("")
        }
    }

    // A group whose buttons are not registered yet has no known main unit: guessing
    // one would make the callers act on a unit the player may not have focused.
    let mainSelectedUnit: Unit | undefined
    if (selectionCount <= 1) {
        mainSelectedUnit = localSelectedUnits[0]
    } else if (mainSelectedUnitIndex != undefined) {
        mainSelectedUnit = localSelectedUnits[mainSelectedUnitIndex]
    }

    for (const i of $range(1, selectionCount)) {
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
    const isDE = loadTOCFile(deTocPath)
    const isHD = !isDE && loadTOCFile(hdTocPath)
    rawset(LocalClient, "isDE", isDE)
    rawset(LocalClient, "isHD", isHD)
    rawset(LocalClient, "isSD", !isDE && !isHD)
    rawset(
        LocalClient,
        "graphicsMode",
        isDE ? GraphicsMode.DE : isHD ? GraphicsMode.HD : GraphicsMode.SD,
    )
})
