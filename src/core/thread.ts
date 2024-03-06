import { Timer } from "./types/timer"

const cocreate = coroutine.create
const coresume = coroutine.resume
const corunning = coroutine.running
const coyield = coroutine.yield

const cache = setmetatable(new LuaTable<LuaThread, Thread | undefined>(), { __mode: "k" })

export class Thread {
    private constructor(private readonly t: LuaThread) {
        cache.set(t, this)
    }

    public static start(f: (this: void, thread: Thread) => void): Thread {
        const lt = cocreate(f)
        const t = new Thread(lt)
        Timer.run(() => {
            coresume(lt, t)
        })
        return t
    }

    public static running(): Thread {
        const [lt] = corunning()
        return cache.get(lt) ?? new Thread(lt)
    }

    public sleep(seconds: number): void {
        Timer.simple(seconds, () => {
            coresume(this.t)
        })
        coyield()
    }
}
