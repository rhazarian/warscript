import { Handle, HandleConstructor } from "./handle"

const getHandleId = GetHandleId

export class Agent<H extends jagent> extends Handle<H> {
    protected static isHandleValid<H extends jhandle, T extends Handle<H>, Args extends any[]>(
        this: HandleConstructor<H, T, Args> & typeof Handle,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handle: H,
    ): boolean {
        return getHandleId(handle) != 0
    }
}
