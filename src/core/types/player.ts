import { Handle, HandleDestructor } from "./handle"
import { Event, InitializingEvent, TriggerEvent } from "../../event"
import { Timer } from "./timer"
import { PlayerCamera } from "./playerCamera"
import { PlayerColor } from "./playerColor"
import { IllegalStateException } from "../../exception"
import { UpgradeId } from "../../engine/object-data/entry/upgrade"
import { MAXIMUM_INTEGER } from "../../math"
import { PLAYER_LOCAL_HANDLE } from "../../engine/internal/misc/player-local-handle"

const getPlayerAlliance = GetPlayerAlliance
const getPlayerColor = GetPlayerColor
const getPlayerName = GetPlayerName
const getPlayerTechCount = GetPlayerTechCount
const getPlayerTechMaxAllowed = GetPlayerTechMaxAllowed
const getTriggerPlayer = GetTriggerPlayer
const setPlayerAlliance = SetPlayerAlliance
const setPlayerTechMaxAllowed = SetPlayerTechMaxAllowed
const setPlayerTechResearched = SetPlayerTechResearched
const setPlayerAbilityAvailable = SetPlayerAbilityAvailable
const playerNative = _G.Player

type Collector<T extends any[]> = () => LuaMultiReturn<T>

interface Unit {
    handle: junit
}

export const enum PlayerAllianceType {
    PASSIVE,
    RESCUABLE,
    HELP_REQUEST,
    HELP_RESPONSE,
    SHARED_XP,
    SHARED_SPELLS,
    SHARED_VISION,
    SHARED_VISION_FORCED,
    SHARED_CONTROL,
    SHARED_ADVANCED_CONTROL,
}

const nativeByPlayerAllianceType = {
    [PlayerAllianceType.PASSIVE]: ALLIANCE_PASSIVE,
    [PlayerAllianceType.RESCUABLE]: ALLIANCE_RESCUABLE,
    [PlayerAllianceType.HELP_REQUEST]: ALLIANCE_HELP_REQUEST,
    [PlayerAllianceType.HELP_RESPONSE]: ALLIANCE_HELP_RESPONSE,
    [PlayerAllianceType.SHARED_XP]: ALLIANCE_SHARED_XP,
    [PlayerAllianceType.SHARED_SPELLS]: ALLIANCE_SHARED_SPELLS,
    [PlayerAllianceType.SHARED_VISION]: ALLIANCE_SHARED_VISION,
    [PlayerAllianceType.SHARED_VISION_FORCED]: ALLIANCE_SHARED_VISION_FORCED,
    [PlayerAllianceType.SHARED_CONTROL]: ALLIANCE_SHARED_CONTROL,
    [PlayerAllianceType.SHARED_ADVANCED_CONTROL]: ALLIANCE_SHARED_ADVANCED_CONTROL,
} as const

export class Player extends Handle<jplayer> {
    public static readonly all: Player[] = (() => {
        const all: Player[] = []
        for (const i of $range(1, bj_MAX_PLAYER_SLOTS)) {
            all[i - 1] = Player.of(playerNative(i - 1))
        }
        return all
    })()

    public static readonly local = Player.of(PLAYER_LOCAL_HANDLE)
    public static readonly neutralPassive = Player.all[PLAYER_NEUTRAL_PASSIVE]
    public static readonly neutralAggressive = Player.all[PLAYER_NEUTRAL_AGGRESSIVE]
    public static readonly neutralVictim = Player.all[bj_PLAYER_NEUTRAL_VICTIM]
    public static readonly neutralExtra = Player.all[bj_PLAYER_NEUTRAL_EXTRA]

    private static events: { [eventId: number]: Event<any> } = {}

    public readonly id: number

    public constructor(handle: jplayer) {
        super(handle)
        this.id = GetPlayerId(handle)
    }

    public onDestroy(): HandleDestructor {
        throw new IllegalStateException("Player instances are not supposed to be destroyed.")
    }

    public override toString(): string {
        return `Player(id = ${this.id})`
    }

    public get name(): string {
        return getPlayerName(this.handle)
    }

    public set name(name: string) {
        SetPlayerName(this.handle, name)
    }

    public get color(): PlayerColor {
        return PlayerColor.of(getPlayerColor(this.handle))
    }

    public set color(color: PlayerColor) {
        SetPlayerColor(this.handle, color.handle)
    }

    public get nameColored(): string {
        return `|c${PlayerColor.of(getPlayerColor(this.handle)).hexCode}${getPlayerName(
            this.handle,
        )}|r`
    }

    get gold(): number {
        return GetPlayerState(this.handle, PLAYER_STATE_RESOURCE_GOLD)
    }

    set gold(gold: number) {
        SetPlayerState(this.handle, PLAYER_STATE_RESOURCE_GOLD, gold)
    }

    get lumber(): number {
        return GetPlayerState(this.handle, PLAYER_STATE_RESOURCE_LUMBER)
    }

    set lumber(gold: number) {
        SetPlayerState(this.handle, PLAYER_STATE_RESOURCE_LUMBER, gold)
    }

    public get isLocal(): boolean {
        const isLocal = this == Player.local
        rawset(this, "isLocal", isLocal)
        return isLocal
    }

    public get camera(): PlayerCamera {
        const camera = PlayerCamera.of(this.handle)
        rawset(this, "camera", camera)
        return camera
    }

    get isUser(): boolean {
        return GetPlayerController(this.handle) == MAP_CONTROL_USER
    }

    get isPlaying(): boolean {
        return GetPlayerSlotState(this.handle) == PLAYER_SLOT_STATE_PLAYING
    }

    public get controller(): jmapcontrol {
        return GetPlayerController(this.handle)
    }

    public get slotState(): jplayerslotstate {
        return GetPlayerSlotState(this.handle)
    }

    public clearSelection(): void {
        if (this.isLocal) {
            ClearSelection()
        }
    }

    public selectSingle(unit: Unit): void {
        if (this.isLocal) {
            ClearSelection()
            SelectUnit(unit.handle, true)
        }
    }

    public select(unit: Unit): void {
        if (this.isLocal) {
            SelectUnit(unit.handle, true)
        }
    }

    public deselect(unit: Unit): void {
        if (this.isLocal) {
            SelectUnit(unit.handle, false)
        }
    }

    public forceUIKey(key: string): void {
        if (this.isLocal) {
            ForceUIKey(key)
        }
    }

    public forceUICancel(): void {
        if (this.isLocal) {
            ForceUICancel()
        }
    }

    public isAllyOf(other: Player): boolean {
        return IsPlayerAlly(this.handle, other.handle)
    }

    public isEnemyOf(other: Player): boolean {
        return IsPlayerEnemy(this.handle, other.handle)
    }

    public setAlliance(other: Player, type: PlayerAllianceType, value: boolean): void {
        setPlayerAlliance(this.handle, other.handle, nativeByPlayerAllianceType[type], value)
    }

    public getAlliance(other: Player, type: PlayerAllianceType): boolean {
        return getPlayerAlliance(this.handle, other.handle, nativeByPlayerAllianceType[type])
    }

    public setAbilityAvailable(abilityId: number, available: boolean): void {
        setPlayerAbilityAvailable(this.handle, abilityId, available)
    }

    public getMaximumUpgradeLevel(upgradeId: UpgradeId): number {
        return getPlayerTechMaxAllowed(this.handle, upgradeId)
    }

    public setMaximumUpgradeLevel(upgradeId: UpgradeId, maximumLevel: number): void {
        setPlayerTechMaxAllowed(this.handle, upgradeId, maximumLevel)
    }

    public resetMaximumUpgradeLevel(upgradeId: UpgradeId): void {
        setPlayerTechMaxAllowed(this.handle, upgradeId, MAXIMUM_INTEGER)
    }

    public getUpgradeLevel(upgradeId: UpgradeId): number {
        return getPlayerTechCount(this.handle, upgradeId, true)
    }

    public setUpgradeLevel(upgradeId: UpgradeId, level: number): void {
        setPlayerTechResearched(this.handle, upgradeId, level)
    }

    private static getEvent<T extends any[]>(
        event: jplayerevent,
        collector: Collector<T>,
    ): Event<T> {
        const eventId = GetHandleId(event)
        if (!this.events[eventId]) {
            this.events[eventId] = new TriggerEvent<T>((trigger) => {
                for (const player of Player.all) {
                    TriggerRegisterPlayerEvent(trigger, player.handle, event)
                }
            }, collector)
        }
        return this.events[eventId]
    }

    private static getMouseEvent<T extends any[]>(
        event: jplayerevent,
        collector: Collector<T>,
    ): Event<T> {
        const eventId = GetHandleId(event)
        if (!this.events[eventId]) {
            this.events[eventId] = new TriggerEvent<T>(
                (trigger) => {
                    /** Mouse events may cause a crash when triggered from the loading screen. We initialize them after. */
                    Timer.simple(0, () => {
                        for (const player of Player.all) {
                            TriggerRegisterPlayerEvent(trigger, player.handle, event)
                        }
                    })
                },
                collector || (() => []),
            )
        }
        return this.events[eventId]
    }

    public static get allianceChangedEvent(): Event<[Player]> {
        return Player.getEvent(EVENT_PLAYER_ALLIANCE_CHANGED, () =>
            $multi(Player.of(getTriggerPlayer())),
        )
    }

    static get onLeave(): Event<[Player]> {
        return Player.getEvent(EVENT_PLAYER_LEAVE, () => $multi(Player.of(getTriggerPlayer())))
    }

    static get onMouseDown(): Event<[Player, jmousebuttontype]> {
        return Player.getMouseEvent(EVENT_PLAYER_MOUSE_DOWN, () =>
            $multi(Player.of(getTriggerPlayer()), BlzGetTriggerPlayerMouseButton()),
        )
    }

    static get onMouseUp(): Event<[Player, jmousebuttontype]> {
        return Player.getMouseEvent(EVENT_PLAYER_MOUSE_UP, () =>
            $multi(Player.of(getTriggerPlayer()), BlzGetTriggerPlayerMouseButton()),
        )
    }

    static get onMouseMove(): Event<[Player, Vec2]> {
        return Player.getMouseEvent(EVENT_PLAYER_MOUSE_MOVE, () =>
            $multi(
                Player.of(getTriggerPlayer()),
                vec2(BlzGetTriggerPlayerMouseX(), BlzGetTriggerPlayerMouseY()),
            ),
        )
    }

    private static getKeyEvent(isDown: boolean): InitializingEvent<
        [Player, joskeytype, oskeymeta]
    > & {
        readonly [key: joskeytype]: InitializingEvent<[Player, oskeymeta]> & {
            readonly [meta: oskeymeta]: InitializingEvent<[Player]>
        }
    } {
        const trigger = CreateTrigger()

        const registered: Record<string, true | undefined> = {}
        const register = (key: joskeytype, metakey: oskeymeta): void => {
            if (!registered[GetHandleId(key) + "|" + metakey]) {
                registered[GetHandleId(key) + "|" + metakey] = true
                for (const player of Player.all) {
                    BlzTriggerRegisterPlayerKeyEvent(trigger, player.handle, key, metakey, isDown)
                }
            }
        }

        const keyEvents: Record<
            joskeytype,
            InitializingEvent<[Player, oskeymeta]> & {
                readonly [meta: oskeymeta]: InitializingEvent<[Player]>
            }
        > = {}

        const event = new InitializingEvent<[Player, joskeytype, oskeymeta]>(() => {
            for (let oskey = 1; oskey < 255; ++oskey) {
                for (let metakey = 0; metakey < 15; ++metakey) {
                    register(ConvertOsKeyType(oskey), metakey as oskeymeta)
                }
            }
        })

        TriggerAddCondition(
            trigger,
            Condition(() => {
                const player = Player.of(getTriggerPlayer())
                const key = BlzGetTriggerPlayerKey()
                const metaKey = BlzGetTriggerPlayerMetaKey() as oskeymeta
                Event.invoke(event, player, key, metaKey)
                const keyEvent = keyEvents[key]
                if (keyEvent != undefined) {
                    Event.invoke(keyEvent, player, metaKey)
                    const metaKeyEvent = rawget(keyEvent, metaKey)
                    if (metaKeyEvent != undefined) {
                        Event.invoke(metaKeyEvent, player)
                    }
                }
            }),
        )

        return setmetatable(
            {},
            {
                __index(this: any, key: joskeytype | keyof typeof event) {
                    if (typeof key == "string") {
                        return event[key]
                    }

                    const keyEvent = new InitializingEvent<[Player, oskeymeta]>(() => {
                        for (let metakey = 0; metakey < 5; ++metakey) {
                            register(key, metakey as oskeymeta)
                        }
                    }) as InitializingEvent<[Player, oskeymeta]> & {
                        [meta: oskeymeta]: InitializingEvent<[Player]>
                    }

                    const mt = setmetatable(
                        {},
                        {
                            __index(this: any, metaKey: oskeymeta | keyof typeof keyEvent) {
                                if (typeof metaKey == "string") {
                                    return keyEvent[metaKey]
                                }

                                const metaKeyEvent = new InitializingEvent<[Player]>(() => {
                                    register(key, metaKey as oskeymeta)
                                })
                                keyEvent[metaKey] = metaKeyEvent
                                rawset(this, metaKey, metaKeyEvent)
                                return metaKeyEvent
                            },
                            __newindex: keyEvent,
                        },
                    )
                    keyEvents[key] = mt as any
                    rawset(this, key, mt)
                    return mt
                },
                __newindex: event,
            },
        ) as any
    }

    public static get onKeyPress(): InitializingEvent<[Player, joskeytype, oskeymeta]> & {
        readonly [key: joskeytype]: InitializingEvent<[Player, oskeymeta]> & {
            readonly [meta: oskeymeta]: InitializingEvent<[Player]>
        }
    } {
        const onKeyPress = this.getKeyEvent(true)
        rawset(this, "onKeyPress", onKeyPress)
        return onKeyPress
    }

    public static get onKeyRelease(): InitializingEvent<[Player, joskeytype, oskeymeta]> & {
        readonly [key: joskeytype]: InitializingEvent<[Player, oskeymeta]> & {
            readonly [meta: oskeymeta]: InitializingEvent<[Player]>
        }
    } {
        const onKeyRelease = this.getKeyEvent(false)
        rawset(this, "onKeyRelease", onKeyRelease)
        return onKeyRelease
    }

    public static get onChat(): Event<[player: Player, message: string]> {
        const event = new TriggerEvent(
            (trigger) => {
                for (const player of Player.all) {
                    TriggerRegisterPlayerChatEvent(trigger, player.handle, "", false)
                }
            },
            () => $multi(Player.of(getTriggerPlayer()), GetEventPlayerChatString()),
        )
        rawset(this, "onChat", event)
        return event
    }

    public static byId(id: number): Player | undefined {
        return Player.all[id]
    }
}
