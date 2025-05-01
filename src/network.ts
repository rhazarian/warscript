import { Event, TriggerEvent } from "./event"
import { IllegalArgumentException } from "./exception"
import { Player } from "./core/types/player"
import { Operation, OperationContinue, OperationMonitor } from "./operation"
import { decode, encode } from "./utility/base64"

const getTriggerPlayer = GetTriggerPlayer
const getTriggerSyncData = BlzGetTriggerSyncData
const sendSyncData = BlzSendSyncData
const triggerRegisterPlayerSyncEvent = BlzTriggerRegisterPlayerSyncEvent

const concat = table.concat
const pack = string.pack
const sub = string.sub
const unpack = string.unpack

export const MAX_PAYLOAD_LENGTH = 255

export const onReceive = setmetatable(
    {} as {
        [prefix: string]: Event<[Player, string]>
    },
    {
        __index(prefix: string): Event<[Player, string]> {
            const event = new TriggerEvent(
                (trigger) => {
                    for (const player of Player.all) {
                        triggerRegisterPlayerSyncEvent(trigger, player.handle, prefix, false)
                    }
                },
                () => $multi(Player.of(getTriggerPlayer()), getTriggerSyncData()),
            )
            this[prefix] = event
            return event
        },
    },
)

export function send(id: string, payload: string): void {
    if (payload.length > MAX_PAYLOAD_LENGTH) {
        throw new IllegalArgumentException(
            `payload length must be <= ${MAX_PAYLOAD_LENGTH}, but was ${payload.length}`,
        )
    }
    sendSyncData(id, payload)
}

let packetsPerRound = 4

let syncOperation: SyncOperation
let preparePromiseExecutor: PromiseExecutor<number>
let syncPromiseExecutor: PromiseExecutor<OperationContinue | string>

let syncOperationNextId = 1
const syncOperationById = setmetatable(new LuaMap<number, SyncOperation>(), { __mode: "v" })
export class SyncOperation extends Operation<string> {
    private readonly x: number // id
    private readonly p: string // id, packed
    private readonly c: string[] = [] // synced chunks
    private readonly d: string // local data
    private readonly l: number // local data.length
    private e?: PromiseResolve<number> // resolve - estimate
    private w?: PromiseResolve<OperationContinue | string> // resolve - work
    private r?: PromiseReject // reject
    private i = 1 // local index
    private s = 0 // packets left in round

    public static get packetsPerRound(): number {
        return packetsPerRound
    }

    public static set packetsPerRound(value: number) {
        if (value <= 0 || math.type(value) != "integer") {
            throw new IllegalArgumentException()
        }
        packetsPerRound = value
    }

    public constructor(
        private readonly player: Player,
        data: string,
    ) {
        super()
        if (!player.isUser || !player.isPlaying) {
            throw new IllegalArgumentException()
        }
        const id = syncOperationNextId++
        syncOperationById.set(id, this)
        this.x = id
        this.p = encode(pack(">i4", id))
        this.d = encode(data)
        this.l = this.d.length
    }

    protected override estimate(): Promise<number> {
        if (this.player.isLocal) {
            sendSyncData("__oh", encode(pack(">i4I4", this.x, this.l)) + sub(this.d, 1, 243))
            this.i = 244
        }
        syncOperation = this
        return new Promise(preparePromiseExecutor)
    }

    protected override work(): string | Promise<OperationContinue | string> {
        if (this.progress >= this.maximum) {
            return decode(concat(this.c))
        }
        this.s = packetsPerRound
        if (this.player.isLocal) {
            let i = this.i
            for (const _ of $range(1, packetsPerRound)) {
                sendSyncData("__oc", this.p + sub(this.d, i, i + 246))
                i += 247
            }
            this.i = i
        }
        syncOperation = this
        return new Promise(syncPromiseExecutor)
    }

    protected override doCancel(): boolean {
        return false
    }

    private static readonly _ = (() => {
        preparePromiseExecutor = (resolve, reject) => {
            syncOperation.e = resolve
            syncOperation.r = reject
        }

        syncPromiseExecutor = (resolve, reject) => {
            syncOperation.w = resolve
            syncOperation.r = reject
        }

        onReceive["__oh"].addListener((player, data) => {
            const [id, length] = unpack(">i4I4", decode(sub(data, 1, 12)))
            const syncOperation = syncOperationById.get(id)
            if (syncOperation) {
                const chunk = sub(data, 13)
                const chunks = syncOperation.c
                chunks[chunks.length] = chunk
                syncOperation.progress += chunk.length
                const resolveEstimate = syncOperation.e
                if (resolveEstimate) {
                    resolveEstimate(length)
                }
            }
        })

        onReceive["__oc"].addListener((player, data) => {
            const [id] = unpack(">i4", decode(sub(data, 1, 8)))
            const syncOperation = syncOperationById.get(id)
            if (syncOperation) {
                const chunk = sub(data, 9)
                const chunks = syncOperation.c
                chunks[chunks.length] = chunk
                syncOperation.progress += chunk.length
                const packetsLeft = syncOperation.s - 1
                syncOperation.s = packetsLeft
                const resolveWork = syncOperation.w
                if (resolveWork) {
                    if (syncOperation.progress >= syncOperation.maximum) {
                        resolveWork(decode(concat(chunks)))
                    } else if (packetsLeft == 0) {
                        resolveWork(OperationContinue)
                    }
                }
            }
        })
    })()
}

export function synchronize(player: Player, data: string): OperationMonitor<string> {
    return new SyncOperation(player, data).execute()
}
