import { Unit } from "../core/types/unit"
import { Async } from "../core/types/async"
import { Event, TriggerEvent } from "../event"
import { GraphicsMode } from "./index"
import { Frame } from "../core/types/frame"
import { Player } from "../core/types/player"
import { Timer } from "../core/types/timer"
import { Color } from "../core/types/color"
import { array } from "../utility/arrays"
import { UnitDefinition } from "../objutil/unit"
import { Socket } from "../net/socket"

const frameGetChild = BlzFrameGetChild
const frameGetChildrenCount = BlzFrameGetChildrenCount
const frameGetParent = BlzFrameGetParent
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

const selectionWarmupUnitTypeId = compiletime(() => {
    const dummy = new UnitDefinition("hfoo", undefined, {
        name: "[Warscript/Selection Warmup] Unit",
        model: "",
        modelHD: "",
        foodCost: 0,
        movementType: "none",
        collisionSize: 0,
        selectionScale: 0,
        sightRadiusDay: 0,
        sightRadiusNight: 0,
        abilitiesNormal: ["Avul"],
    })
    dummy.weapons[0].enabled = false
    dummy.weapons[1].enabled = false
    return fourCC(dummy.id)
})

const SELECTION_DETAIL_FRAME_NAME = "SimpleInfoPanelUnitDetail"
const SELECTION_GROUP_PANEL_INDEX = 5
const SELECTION_BUTTON_ICON_INDEX = 1
/** The detail panel, its parent, the group panel and the button grid. */
const SELECTION_LAYOUT_ROOT_HANDLE_COUNT = 4
/** The group selection layouts by button count, in the order the startup warmup goes through them. */
const SELECTION_LAYOUT_BUTTON_COUNTS = [24, 12]

const getSelectionButtons = (): Frame => {
    return Frame.byName(SELECTION_DETAIL_FRAME_NAME)
        .parent.getChild(SELECTION_GROUP_PANEL_INDEX)
        .getChild(0)
}

const getMainSelectedUnitIndex = (
    selectionButtons: Frame,
    buttonCount: number,
): number | undefined => {
    let mainSelectedUnitIndex: number | undefined
    let maxButtonWidth = 0
    for (const i of $range(0, buttonCount - 1)) {
        const width = selectionButtons.getChild(i).getChild(SELECTION_BUTTON_ICON_INDEX).width
        if (width > maxButtonWidth) {
            maxButtonWidth = width
            mainSelectedUnitIndex = i
        }
    }
    return mainSelectedUnitIndex
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

/**
 * Wraps every frame of the group selection layout currently shown on this client, in the
 * order `actualizeMainSelectedUnit` later walks them. Game-owned frames receive a JASS handle
 * id the first time a script retrieves them, so this must run on every client in the same
 * tick and register the same number of handles everywhere: every frame reached for the first
 * time counts, and the remainder up to the layout's total is padded with locations, the way
 * `Frame.byOrigin` balances origin frames that appear asynchronously.
 *
 * Returns whether the local layout has `buttonCount` buttons and every frame was reached.
 */
const registerSelectionLayoutFrames = (buttonCount: number): boolean => {
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
    let complete = grid != undefined && frameGetChildrenCount(grid) == buttonCount
    for (const i of $range(0, buttonCount - 1)) {
        const button = register(getChildIfPresent(grid, i))
        const icon = register(getChildIfPresent(button, SELECTION_BUTTON_ICON_INDEX))
        if (icon == undefined) {
            complete = false
        }
    }
    const totalHandleCount = SELECTION_LAYOUT_ROOT_HANDLE_COUNT + 2 * buttonCount
    for (let i = registeredCount; i < totalHandleCount; i++) {
        location(0, 0)
    }
    return complete
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
     * Local selection sampled every 1/64 second. Undefined before the first tick
     * or until startup selection-frame initialization has finished.
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

    for (const i of $range(1, localSelectedUnits.length)) {
        indexByLocalSelectedUnit.set(localSelectedUnits[i - 1], i)
    }

    tableSort(localSelectedUnits, compareUnitsSelectionPriority)

    let mainSelectedUnitIndex: number | undefined
    if (localSelectedUnits.length > 1) {
        // Both layouts were registered on every client during startup, so these
        // lookups return the wrappers created back then. Re-resolve them every
        // time instead of retaining handles across layout changes.
        const selectionButtons = getSelectionButtons()
        mainSelectedUnitIndex = getMainSelectedUnitIndex(
            selectionButtons,
            selectionButtons.getChildrenCount(),
        )
    }

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
    actualizeTargetingModeState()
})

const initializeSelectionFrames = (): void => {
    type PlayerWarmup = {
        player: Player
        units: Unit[]
        previousSelection: Unit[]
        /** The round in which the player last reported the current stage's layout as shown. */
        seenRound: number
        /** The round whose registration result the player last reported. */
        registrationRound: number
        registrationSucceeded: boolean
    }
    const warmups: PlayerWarmup[] = []
    const warmupByPlayer = new LuaMap<Player, PlayerWarmup>()
    const dummyUnits = new LuaSet<Unit>()
    const socket = new Socket()
    // The warmup goes through the layouts of SELECTION_LAYOUT_BUTTON_COUNTS one stage at a
    // time. A stage is one or more rounds: every active player reports the stage's layout
    // as shown, then all clients register its frames in the same tick and report whether
    // their layout was complete. A failed report starts another round; success moves on.
    let stageIndex = 0
    let round = 0
    let registering = false
    /** The round whose frames this client has registered. */
    let registeredRound = 0
    let finished = false
    let sentSeenRound = 0
    let seenMessage = ""
    let registeredMessage = ""
    let failedMessage = ""

    const getStageButtonCount = (): number => {
        return SELECTION_LAYOUT_BUTTON_COUNTS[stageIndex]
    }

    const retrySelection = (): void => {
        const count = getStageButtonCount()
        for (const warmup of warmups) {
            if (!warmup.player.isPlaying) {
                continue
            }
            if (warmup.player == Player.local) {
                const selection = Unit.getSelectionOf(Player.local)
                const normalSelection = selection.filter((unit) => !dummyUnits.has(unit))
                if (normalSelection.length > 0 || selection.length == 0) {
                    warmup.previousSelection = normalSelection
                }
            }
            warmup.player.clearSelection()
            for (const i of $range(0, count - 1)) {
                warmup.player.select(warmup.units[i])
            }
        }
    }

    const startRound = (): void => {
        round++
        registering = false
        const count = getStageButtonCount()
        seenMessage = `seen${count}`
        registeredMessage = `registered${count}`
        failedMessage = `failed${count}`
        retrySelection()
        checkProgress()
    }

    const finish = (): void => {
        finished = true
        retryTimer.destroy()
        Timer.onPeriod[1 / 64].removeListener(observeSelection)
        socket.onMessage.removeListener(onMessage)
        Player.onLeave.removeListener(onPlayerLeave)

        // Preserve a manual selection. Restore the saved selection only when
        // startup dummies still occupy the local selection.
        let restoreSelection: Unit[] | undefined
        const selection = Unit.getSelectionOf(Player.local)
        for (const unit of selection) {
            if (dummyUnits.has(unit)) {
                restoreSelection = selection.filter((selected) => !dummyUnits.has(selected))
                if (restoreSelection.length == 0) {
                    restoreSelection = warmupByPlayer.get(Player.local)?.previousSelection
                }
                Player.local.clearSelection()
                break
            }
        }
        for (const warmup of warmups) {
            for (const unit of warmup.units) {
                unit.destroy()
            }
            warmup.units = []
        }
        if (restoreSelection != undefined) {
            for (const unit of restoreSelection) {
                if (getUnitTypeId(unit.handle) != 0) {
                    Player.local.select(unit)
                }
            }
        }
        // Every layout's frames are registered on every remaining client. Only now
        // may the normal polling start accessing the current selection frames.
        Timer.onPeriod[1 / 64].addListener(actualizeMainSelectedUnit)
    }

    const checkProgress = (): void => {
        if (finished || registering) {
            return
        }
        for (const warmup of warmups) {
            if (warmup.player.isPlaying && warmup.seenRound != round) {
                return
            }
        }
        registering = true
        Timer.simple(1 / 64, registerStage)
    }

    const registerStage = (): void => {
        if (finished) {
            return
        }
        registeredRound = round
        const succeeded = registerSelectionLayoutFrames(getStageButtonCount())
        if (warmupByPlayer.has(Player.local) && Player.local.isPlaying) {
            socket.send(succeeded ? registeredMessage : failedMessage)
        }
        checkRegistration()
    }

    const checkRegistration = (): void => {
        if (finished || !registering) {
            return
        }
        let succeeded = true
        for (const warmup of warmups) {
            if (!warmup.player.isPlaying) {
                continue
            }
            if (warmup.registrationRound != round) {
                return
            }
            if (!warmup.registrationSucceeded) {
                succeeded = false
            }
        }
        if (!succeeded) {
            startRound()
            return
        }
        if (stageIndex + 1 >= SELECTION_LAYOUT_BUTTON_COUNTS.length) {
            finish()
            return
        }
        stageIndex++
        // Dummies beyond the next layout's size are no longer needed. Their removal
        // depends only on synchronized reports, so it happens in the same tick everywhere.
        const count = getStageButtonCount()
        for (const warmup of warmups) {
            for (const i of $range(warmup.units.length - 1, count, -1)) {
                warmup.units[i].destroy()
                warmup.units[i] = undefined!
            }
        }
        startRound()
    }

    const onMessage = (player: Player, message: string): void => {
        const warmup = warmupByPlayer.get(player)
        if (warmup == undefined || !player.isPlaying) {
            return
        }
        if (message == seenMessage) {
            warmup.seenRound = round
            checkProgress()
        } else if (
            (message == registeredMessage || message == failedMessage) &&
            // Reports are sent in the registration tick, which every client runs
            // before any report can arrive; anything earlier is not a report.
            registeredRound == round
        ) {
            warmup.registrationRound = round
            warmup.registrationSucceeded = message == registeredMessage
            checkRegistration()
        }
    }

    const onPlayerLeave = (): void => {
        checkProgress()
        checkRegistration()
    }

    const observeSelection = (): void => {
        if (
            sentSeenRound == round ||
            !warmupByPlayer.has(Player.local) ||
            !Player.local.isPlaying
        ) {
            return
        }
        // Sample the local selection outside selection event callbacks. Those
        // events can lag behind the UI and must not determine its current layout.
        // The layout follows the selection size alone, whether or not the selected
        // units are startup dummies: 2 to 12 units use the 12-button layout, 13 to 24
        // the 24-button one.
        const localSelectionCount = Unit.getSelectionOf(Player.local).length
        const maximumCount = getStageButtonCount()
        const minimumCount = maximumCount == 12 ? 2 : 13
        if (localSelectionCount >= minimumCount && localSelectionCount <= maximumCount) {
            socket.send(seenMessage)
            sentSeenRound = round
        }
    }

    for (const player of Player.all) {
        if (player.isUser && player.isPlaying) {
            const warmup: PlayerWarmup = {
                player,
                units: [],
                previousSelection: player == Player.local ? Unit.getSelectionOf(player) : [],
                seenRound: 0,
                registrationRound: 0,
                registrationSucceeded: false,
            }
            warmups[warmups.length] = warmup
            warmupByPlayer.set(player, warmup)
            for (const i of $range(0, SELECTION_LAYOUT_BUTTON_COUNTS[0] - 1)) {
                const unit = assert(Unit.create(player, selectionWarmupUnitTypeId, 0, 0, 0))
                unit.isPaused = true
                warmup.units[i] = unit
                dummyUnits.add(unit)
            }
        }
    }
    socket.onMessage.addListener(onMessage)
    Player.onLeave.addListener(onPlayerLeave)
    Timer.onPeriod[1 / 64].addListener(observeSelection)
    // Map initialization may override our selection; retry the stage's layout every
    // second until its registration succeeded, without recreating dummy units.
    const retryTimer = Timer.periodic(1, retrySelection)
    startRound()
    observeSelection()
}

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

Timer.run(initializeSelectionFrames)
