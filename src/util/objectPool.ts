const noOp: (object: any) => void = () => {
    // no-op
}

export class ObjectPool<T> {
    public readonly get: (this: void) => T
    public readonly release: (this: void, object: T) => void

    public constructor(create: () => T, cleanUp: (object: T) => void = noOp) {
        const pool: T[] = []
        let n = 1
        this.get = () => {
            if (n > 1) {
                --n
                return pool[n - 1]
            }
            return create()
        }
        this.release = (object: T) => {
            cleanUp(object)
            pool[n - 1] = object
            ++n
        }
    }
}
