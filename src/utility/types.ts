export type AnyNonNullable = {}

export type IsExactlyAny<T> = boolean extends (T extends never ? true : false) ? true : false

export type NonEmptyArray<T> = [T, ...T[]]

export type InvertRecordType<T extends Record<PropertyKey, PropertyKey | null | undefined>> = {
    [P in keyof T as NonNullable<T[P]>]: P
}

export type Constructor<T = any> = new (...args: any) => T

export type AbstractConstructor<T = any> = abstract new (...args: any) => T

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type ValueOf<T> = T[keyof T]

export type EntryOf<T> = ValueOf<{ [K in keyof T]: [K, T[K]] }>

export type MutableKeys<T extends object> = keyof T &
    {
        [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
    }[keyof T]

export type ReadonlyKeys<T extends object> = keyof T &
    {
        [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>
    }[keyof T]

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
    ? 1
    : 2
    ? A
    : B

type KeysOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P }

export type TupleOf<T, N extends number> = N extends N
    ? number extends N
        ? T[]
        : _TupleOf<T, N, []>
    : never

type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
    ? R
    : _TupleOf<T, N, [T, ...R]>

export type Flatten<T extends readonly any[], A extends readonly any[] = []> = T extends [
    infer F,
    ...infer R
]
    ? Flatten<R, F extends readonly any[] ? [...A, ...F] : [...A, F]>
    : A

export type Prohibit<T, K extends keyof any> = T & {
    [P in K]?: never
}
