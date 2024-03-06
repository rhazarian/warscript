import "./decl/index"

declare global {
    type KeysOfType<T, U> = {
        [P in keyof T]: T[P] extends U ? P : never
    }[keyof T]

    type NonConstructorKeys<T> = {
        [P in keyof T]: T[P] extends new () => any ? never : P
    }[keyof T]

    type OmitConstructor<T> = Pick<T, NonConstructorKeys<T>>
}
