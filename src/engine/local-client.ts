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

const getSelectionButtons = (): Frame => {
    return Frame.byName("SimpleInfoPanelUnitDetail").parent.getChild(5).getChild(0)
}

const getMainSelectedUnitIndex = (
    selectionButtons: Frame,
    buttonCount: number,
): number | undefined => {
    let mainSelectedUnitIndex: number | undefined
    let maxButtonWidth = 0
    for (const i of $range(0, buttonCount - 1)) {
        const width = selectionButtons.getChild(i).getChild(1).width
        if (width > maxButtonWidth) {
            maxButtonWidth = width
            mainSelectedUnitIndex = i
        }
    }
    return mainSelectedUnitIndex
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
        // Both layouts were initialized during startup. Always re-resolve the
        // current frames instead of retaining handles across layout changes.
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
        hasSeen12: boolean
        hasSeen24: boolean
    }
    const warmups: PlayerWarmup[] = []
    const warmupByPlayer = new LuaMap<Player, PlayerWarmup>()
    const dummyUnits = new LuaSet<Unit>()
    const socket = new Socket()
    let finished = false
    let transitionPending = false
    let sent12 = false
    let sent24 = false

    const retrySelection = (): void => {
        for (const warmup of warmups) {
            if (!warmup.player.isPlaying || (warmup.hasSeen12 && warmup.hasSeen24)) {
                continue
            }
            const count = warmup.hasSeen24 ? 12 : 24
            if (warmup.player == Player.local) {
                const selection = Unit.getSelectionOf(Player.local)
                const minimumCount = count == 12 ? 2 : 13
                // A suitable manual selection may already be awaiting its sync
                // acknowledgement. Do not replace it with dummies in that case.
                if (selection.length < minimumCount || selection.length > count) {
                    const normalSelection = selection.filter((unit) => !dummyUnits.has(unit))
                    if (normalSelection.length > 0 || selection.length == 0) {
                        warmup.previousSelection = normalSelection
                    }
                    warmup.player.clearSelection()
                    for (const i of $range(0, count - 1)) {
                        warmup.player.select(warmup.units[i])
                    }
                }
            }
            // Unit removal depends only on synchronized acknowledgements.
            if (count == 12 && warmup.units.length == 24) {
                for (const i of $range(23, 12, -1)) {
                    warmup.units[i].destroy()
                    warmup.units[i] = undefined!
                }
            }
        }
    }

    const finish = (): void => {
        finished = true
        retryTimer.destroy()
        Timer.onPeriod[1 / 64].removeListener(observeSelection)
        socket.onMessage.removeListener(onMessage)
        Player.onLeave.removeListener(checkProgress)

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
        // Every remaining player has observed both layouts. Only now may the
        // normal polling start accessing the current selection frames.
        Timer.onPeriod[1 / 64].addListener(actualizeMainSelectedUnit)
    }

    const checkProgress = (): void => {
        if (finished || transitionPending) {
            return
        }
        for (const warmup of warmups) {
            if (warmup.player.isPlaying && (!warmup.hasSeen12 || !warmup.hasSeen24)) {
                return
            }
        }
        transitionPending = true
        Timer.simple(1 / 64, finish)
    }

    const onMessage = (player: Player, layout: string): void => {
        const warmup = warmupByPlayer.get(player)
        if (warmup == undefined || !player.isPlaying) {
            return
        }
        if (layout == "12") {
            warmup.hasSeen12 = true
        } else if (layout == "24") {
            warmup.hasSeen24 = true
        } else {
            return
        }
        checkProgress()
    }
    const observeSelection = (): void => {
        if (!warmupByPlayer.has(Player.local) || !Player.local.isPlaying) {
            return
        }
        // Sample the local selection outside selection event callbacks. Those
        // events can lag behind the UI and must not determine its current layout.
        // A synchronized message records each layout once, in either order,
        // independently of whether the selected units are startup dummies.
        const localSelectionCount = Unit.getSelectionOf(Player.local).length
        if (!sent12 && localSelectionCount >= 2 && localSelectionCount <= 12) {
            socket.send("12")
            sent12 = true
        } else if (!sent24 && localSelectionCount >= 13 && localSelectionCount <= 24) {
            socket.send("24")
            sent24 = true
        }
    }

    for (const player of Player.all) {
        if (player.isUser && player.isPlaying) {
            const warmup: PlayerWarmup = {
                player,
                units: [],
                previousSelection: player == Player.local ? Unit.getSelectionOf(player) : [],
                hasSeen12: false,
                hasSeen24: false,
            }
            warmups[warmups.length] = warmup
            warmupByPlayer.set(player, warmup)
            for (const i of $range(0, 23)) {
                const unit = assert(Unit.create(player, selectionWarmupUnitTypeId, 0, 0, 0))
                unit.isPaused = true
                warmup.units[i] = unit
                dummyUnits.add(unit)
            }
        }
    }
    socket.onMessage.addListener(onMessage)
    Player.onLeave.addListener(checkProgress)
    Timer.onPeriod[1 / 64].addListener(observeSelection)
    // Map initialization may override our selection; retry missing layouts until
    // each active player has acknowledged both, without recreating dummy units.
    const retryTimer = Timer.periodic(1, retrySelection)
    observeSelection()
    retrySelection()
    checkProgress()
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
