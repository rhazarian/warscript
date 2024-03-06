import { Event } from "../event"
import { Player } from "../core/types/player"
import { send, onReceive } from "../network"

let nextId = 0

export class Socket {
    private readonly id = tostring(++nextId)

    public readonly onMessage = new Event<[Player, string]>()

    public constructor() {
        onReceive[this.id].addListener((sender, data) => {
            Event.invoke(this.onMessage, sender, data)
        })
    }

    public send(data: string): void {
        send(this.id, data)
    }
}
