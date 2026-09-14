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

const tocPath = "_warscript\\IsHD.toc"

compiletime(() => {
    if (currentMap) {
        const fdfPath = "_warscript\\IsHD.fdf"
        currentMap.addFileString(`_HD.w3mod\\${fdfPath}`, "\r\n")
        currentMap.addFileString(`_HD.w3mod\\${tocPath}`, `${fdfPath}\r\n`)
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
        acknowledged: LuaSet<Unit>
        acknowledgedCount: number
    }
    const warmups: PlayerWarmup[] = []
    const warmupByUnit = new LuaMap<Unit, PlayerWarmup>()
    let stage: "select24" | "clear24" | "select12" | "finished" = "select24"
    let transitionPending = false

    const finish = (): void => {
        stage = "finished"
        Unit.onSelect.removeListener(onSelect)
        Unit.onDeselect.removeListener(onDeselect)
        Player.onLeave.removeListener(onLeave)
        for (const warmup of warmups) {
            warmup.player.clearSelection()
            for (const unit of warmup.units) {
                warmupByUnit.delete(unit)
                unit.destroy()
            }
            for (const unit of warmup.previousSelection) {
                if (getUnitTypeId(unit.handle) != 0) {
                    warmup.player.select(unit)
                }
            }
        }
        // Startup dummies must never be exposed through the public getter/event.
        Timer.onPeriod[1 / 64].addListener(actualizeMainSelectedUnit)
    }

    const advance = (): void => {
        transitionPending = false
        let hasPlayingPlayer = false
        for (const warmup of warmups) {
            if (warmup.player.isPlaying) {
                hasPlayingPlayer = true
                break
            }
        }
        if (!hasPlayingPlayer) {
            finish()
            return
        }
        if (stage == "select24" || stage == "select12") {
            const expectedButtonCount = stage == "select24" ? 24 : 12
            const selectionButtons = getSelectionButtons()
            assert(
                selectionButtons.getChildrenCount() == expectedButtonCount,
                "selection warmup: unexpected button count",
            )
            // Register the parent, buttons and icons in identical phases on all
            // clients, after all active players acknowledged their selection.
            getMainSelectedUnitIndex(selectionButtons, expectedButtonCount)
        }
        if (stage == "select12") {
            finish()
            return
        }
        const previousStage = stage
        stage = previousStage == "select24" ? "clear24" : "select12"
        for (const warmup of warmups) {
            warmup.acknowledged = new LuaSet()
            warmup.acknowledgedCount = 0
        }
        for (const warmup of warmups) {
            if (previousStage == "select24") {
                warmup.player.clearSelection()
            } else {
                if (warmup.player.isPlaying) {
                    for (const i of $range(0, 11)) {
                        warmup.player.select(warmup.units[i])
                    }
                }
                for (const i of $range(23, 12, -1)) {
                    const unit = warmup.units[i]
                    warmupByUnit.delete(unit)
                    unit.destroy()
                    warmup.units[i] = undefined!
                }
            }
        }
    }

    const checkProgress = (): void => {
        if (stage == "finished" || transitionPending) {
            return
        }
        const expectedCount = stage == "select12" ? 12 : 24
        for (const warmup of warmups) {
            if (warmup.player.isPlaying && warmup.acknowledgedCount != expectedCount) {
                return
            }
        }
        transitionPending = true
        // Leave the selection event callback before accessing UI or changing
        // selection again; use the same deferred transition on every client.
        Timer.simple(1 / 64, advance)
    }

    const acknowledge = (unit: Unit, player: Player): void => {
        const warmup = warmupByUnit.get(unit)
        if (warmup != undefined && warmup.player == player && !warmup.acknowledged.has(unit)) {
            warmup.acknowledged.add(unit)
            warmup.acknowledgedCount++
            checkProgress()
        }
    }
    const onSelect = (unit: Unit, player: Player): void => {
        if (stage == "select24" || stage == "select12") {
            acknowledge(unit, player)
        }
    }
    const onDeselect = (unit: Unit, player: Player): void => {
        if (stage == "clear24") {
            acknowledge(unit, player)
        }
    }
    const onLeave = (): void => {
        checkProgress()
    }

    for (const player of Player.all) {
        if (player.isUser && player.isPlaying) {
            const warmup: PlayerWarmup = {
                player,
                units: [],
                previousSelection: Unit.getSelectionOf(player),
                acknowledged: new LuaSet(),
                acknowledgedCount: 0,
            }
            warmups[warmups.length] = warmup
            for (const i of $range(0, 23)) {
                const unit = assert(Unit.create(player, selectionWarmupUnitTypeId, 0, 0, 0))
                unit.isPaused = true
                warmup.units[i] = unit
                warmupByUnit.set(unit, warmup)
            }
        }
    }
    Unit.onSelect.addListener(onSelect)
    Unit.onDeselect.addListener(onDeselect)
    Player.onLeave.addListener(onLeave)
    for (const warmup of warmups) {
        warmup.player.clearSelection()
        for (const unit of warmup.units) {
            warmup.player.select(unit)
        }
    }
    checkProgress()
}

warpack.afterMapInit(() => {
    rawset(LocalClient, "isHD", loadTOCFile(tocPath))
})

Timer.run(initializeSelectionFrames)
