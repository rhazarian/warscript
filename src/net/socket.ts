import { Event } from "../event"
import { Player } from "../core/types/player"
import { send, onReceive, MAX_PAYLOAD_LENGTH } from "../network"
import { ceil } from "../math"

let nextId = 0

const enum SocketPropertyKey {
    ID,
    CHUNK_ID,
}

export class Socket {
    private readonly [SocketPropertyKey.ID] = tostring(++nextId)
    private readonly [SocketPropertyKey.CHUNK_ID] = tostring(++nextId)

    public readonly onMessage = new Event<[Player, string]>()

    public constructor() {
        const chunksByPlayer = new LuaMap<Player, string[]>()
        onReceive[this[SocketPropertyKey.ID]].addListener((sender, data) => {
            const chunks = chunksByPlayer.get(sender)
            if (chunks !== undefined) {
                chunks[chunks.length] = data
                Event.invoke(this.onMessage, sender, chunks.join())
                chunksByPlayer.delete(sender)
            } else {
                Event.invoke(this.onMessage, sender, data)
            }
        })
        onReceive[this[SocketPropertyKey.CHUNK_ID]].addListener((sender, data) => {
            let chunks = chunksByPlayer.get(sender)
            if (chunks == undefined) {
                chunks = []
                chunksByPlayer.set(sender, chunks)
            }
            chunks[chunks.length] = data
        })
    }

    public send(data: string): void {
        const chunks = ceil(data.length / MAX_PAYLOAD_LENGTH) - 1
        let offset = 0
        for (const _ of $range(0, chunks - 1)) {
            const nextOffset = offset + MAX_PAYLOAD_LENGTH
            send(this[SocketPropertyKey.CHUNK_ID], data.substring(offset, nextOffset))
            offset = nextOffset
        }
        send(this[SocketPropertyKey.ID], data.substring(offset))
    }
}
