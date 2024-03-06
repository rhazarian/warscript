import { IllegalStateException } from "../exception"

const tostring = _G.tostring
const concat = table.concat
const sort = table.sort

const DONE = {}

export interface Stream<T> {
    toArray(): T[]
    toSet(): Set<T>
    groupingBy<R>(f: (this: void, value: T) => R): Map<R, T[]>
    joining(sep: string): string
    forEach(f: (this: void, value: T) => any): void
    count(): number
    findFirst(): T | null
    reduce<U>(identity: U, accumulator: (this: void, acc: U, value: T) => U): U
    peek(f: (this: void, value: T) => any): Stream<T>
    map<S>(f: (this: void, value: T) => S): Stream<S>
    flatMap<S>(f: (value: T) => Stream<S>): Stream<S>
}

export namespace Stream {
    export function of<T>(array: T[]): Stream<T> {
        const length = array.length
        let i = 0
        return new StreamImpl(() => {
            if (i >= length) {
                return DONE as T
            }
            i++
            return array[i - 1]
        })
    }

    export function ofReversed<T>(array: T[]): Stream<T> {
        let i = array.length + 1
        return new StreamImpl(() => {
            if (i <= 1) {
                return DONE as T
            }
            i--
            return array[i - 1]
        })
    }

    export function ofNullable<T>(element: T | null | undefined): Stream<T> {
        if (element) {
            let next = true
            return new StreamImpl(() => {
                if (next) {
                    next = false
                    return element
                }
                return DONE as T
            })
        }
        return new StreamImpl(() => DONE as T)
    }

    export function range(startInclusive: number, endExclusive: number, step = 1): Stream<number> {
        let i = startInclusive
        return new StreamImpl(() => {
            if (i >= endExclusive) {
                return DONE as number
            }
            const element = i
            i += step
            return element
        })
    }

    export function rangeClosed(
        startInclusive: number,
        endInclusive: number,
        step = 1
    ): Stream<number> {
        let i = startInclusive
        return new StreamImpl(() => {
            if (i > endInclusive) {
                return DONE as number
            }
            const element = i
            i += step
            return element
        })
    }
}

class StreamImpl<T> implements Stream<T> {
    public constructor(protected readonly next: () => T) {}

    public toArray(): T[] {
        const next = this.next
        const array: T[] = []
        let i = 1
        for (let element = next(); element != DONE; element = next()) {
            array[i - 1] = element
            i++
        }
        return array
    }

    public toSet(): Set<T> {
        const next = this.next
        const set = new Set<T>()
        for (let element = next(); element != DONE; element = next()) {
            set.add(element)
        }
        return set
    }

    public groupingBy<R>(f: (this: void, value: T) => R): Map<R, T[]> {
        const next = this.next
        const map = new Map<R, T[]>()
        for (let element = next(); element != DONE; element = next()) {
            const key = f(element)
            const array = map.get(key)
            if (array) {
                array[array.length] = element
            } else {
                map.set(key, [element])
            }
        }
        return map
    }

    public joining(sep: string): string {
        const next = this.next
        const array: string[] = []
        for (let element = next(); element != DONE; element = next()) {
            array[array.length] = tostring(element)
        }
        return concat(array, sep)
    }

    public forEach(f: (this: void, value: T) => any): void {
        const next = this.next
        for (let element = next(); element != DONE; element = next()) {
            f(element)
        }
    }

    public count(): number {
        const next = this.next
        let i = 0
        for (let element = next(); element != DONE; element = next()) {
            i++
        }
        return i
    }

    public findFirst(): T | null {
        const element = this.next()
        return element != DONE ? element : null
    }

    public reduce<U>(identity: U, accumulator: (this: void, acc: U, value: T) => U): U {
        const next = this.next
        let result = identity
        for (let element = next(); element != DONE; element = next()) {
            result = accumulator(result, element)
        }
        return result
    }

    public peek(f: (this: void, value: T) => any): StreamImpl<T> {
        const next = this.next
        return new StreamImpl(() => {
            const element = next()
            f(element)
            return element
        })
    }

    public map<S>(f: (this: void, value: T) => S): StreamImpl<S> {
        const next = this.next
        return new StreamImpl(() => {
            const element = next()
            return element == DONE ? (DONE as S) : f(element)
        })
    }

    public filter(predicate: (this: void, value: T) => boolean): StreamImpl<T> {
        const next = this.next
        return new StreamImpl(() => {
            for (let element = next(); element != DONE; element = next()) {
                if (predicate(element)) {
                    return element
                }
            }
            return DONE as T
        })
    }

    public without(value: T): StreamImpl<T> {
        const next = this.next
        return new StreamImpl(() => {
            for (let element = next(); element != DONE; element = next()) {
                if (element != value) {
                    return element
                }
            }
            return DONE as T
        })
    }

    public nonNull(): StreamImpl<Exclude<T, null | undefined>> {
        const next = this.next
        return new StreamImpl(() => {
            for (let element = next(); element != DONE; element = next()) {
                if (element != null) {
                    return element as Exclude<T, null | undefined>
                }
            }
            return DONE as Exclude<T, null | undefined>
        })
    }

    public distinct(): StreamImpl<T> {
        const next = this.next
        const table = new LuaTable<T & {}, boolean | undefined>()
        let hasNull = false
        return new StreamImpl(() => {
            for (let element = next(); element != DONE; element = next()) {
                if (element == null) {
                    if (!hasNull) {
                        hasNull = true
                        return null as T
                    }
                } else {
                    if (!table.get(element)) {
                        table.set(element, true)
                        return element
                    }
                }
            }
            return DONE as T
        })
    }

    public sorted(): StreamImpl<T> {
        const next = this.next
        const list: T[] = []
        let length = -1
        let i = 0
        return new StreamImpl(() => {
            if (length == -1) {
                length = 1
                for (let element = next(); element != DONE; element = next()) {
                    list[length - 1] = element
                    length++
                }
                length--
                sort(list)
            }
            if (i >= length) {
                return DONE as T
            }
            i++
            return list[i - 1]
        })
    }

    public limit(n: number): StreamImpl<T> {
        const next = this.next
        return new StreamImpl(() => {
            if (n > 0) {
                n--
                return next()
            }
            return DONE as T
        })
    }

    public skip(n: number): StreamImpl<T> {
        const next = this.next
        return new StreamImpl(() => {
            while (n > 0) {
                if (next() == DONE) {
                    return DONE as T
                }
                n--
            }
            return next()
        })
    }

    public flatMap<S>(f: (value: T) => StreamImpl<S>): StreamImpl<S> {
        const next = this.next
        let subnext: (() => S) | undefined
        return new StreamImpl(() => {
            for (;;) {
                if (!subnext) {
                    const element = next()
                    if (element == DONE) {
                        return DONE as S
                    }
                    subnext = f(element).next
                }
                const element = subnext()
                if (element != DONE) {
                    return element
                }
                subnext = undefined
            }
        })
    }

    //public append(stream: StreamImpl<T>): Stream<T> {
    //    let next = this.next
    //return new StreamImpl(() => {
    //
    //}
    //}
}

export interface EntryStream<K, V> extends Stream<[K, V]> {
    invert(): EntryStream<V, K>
    toMap(): Map<K, V>
}

export namespace EntryStream {
    export function of<K, V>(map: Map<K, V> | LuaTable<K & {}, V>): EntryStream<K, V> {
        if (map instanceof Map) {
            const iterator = map.entries()
            return new EntryStreamImpl(() => {
                const result = iterator.next()
                if (result.done) {
                    return DONE as [K, V]
                }
                return result.value
            })
        }
        return new EntryStreamImpl<K, V>(pairs(map))
    }
}

class EntryStreamImpl<K, V> extends StreamImpl<[K, V]> implements EntryStream<K, V> {
    public constructor(next: () => [K, V]) {
        super(next)
    }

    public invert(): EntryStream<V, K> {
        const next = this.next
        return new EntryStreamImpl(() => {
            const element = next()
            return element == DONE ? (DONE as [V, K]) : [element[1], element[0]]
        })
    }

    public toMap(): Map<K, V> {
        const next = this.next
        const map = new Map<K, V>()
        for (let element = next(); element != DONE; element = next()) {
            if (map.has(element[0])) {
                throw new IllegalStateException()
            }
            map.set(element[0], element[1])
        }
        return map
    }
}
