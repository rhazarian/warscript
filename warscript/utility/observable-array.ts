import { Event } from "../event"

export interface ObservableArray<T> extends Array<T> {}
export class ObservableArray<T> {
    /**
     * The backing array.
     * @private
     */
    private readonly a: T[] = []

    public readonly onChange = new Event()

    protected __newindex(index: number, value: T): void {
        this.a[index - 1] = value
        Event.invoke(this.onChange)
    }

    protected __index(index: number): T {
        return this.a[index - 1]
    }

    protected __len(): number {
        return this.a.length
    }

    protected __ipairs(): ReturnType<typeof ipairs<T>> {
        return ipairs(this.a)
    }

    protected __pairs(): ReturnType<typeof pairs> {
        return pairs(this.a)
    }
}
