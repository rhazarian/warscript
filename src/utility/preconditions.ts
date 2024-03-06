import { IllegalArgumentException, IllegalStateException } from "../exception"

const toString = _G.tostring

/**
 * Throws an {@link IllegalArgumentException} if the `value` is false.
 */
export const require: (value: boolean, message?: string) => asserts value is true = (
    value,
    message
) => {
    if (!value) {
        throw new IllegalArgumentException(message ?? "Failed requirement.")
    }
}

/**
 * Throws an {@link IllegalArgumentException} if the `value` is null.
 * Otherwise, returns the not null value.
 */
export const requireNotNull = <T>(value: T, message?: string): NonNullable<T> => {
    if (value == undefined) {
        throw new IllegalArgumentException(message ?? "Required value was null.")
    }
    return value
}

/**
 * Throws an {@link IllegalStateException} if the `value` is false.
 */
export const check: (value: boolean, message?: string) => asserts value is true = (
    value,
    message
) => {
    if (!value) {
        throw new IllegalStateException(message ?? "Check failed.")
    }
}

/**
 * Throws an {@link IllegalStateException} if the `value` is null.
 * Otherwise, returns the not null value.
 */
export const checkNotNull = <T>(value: T, message?: string): NonNullable<T> => {
    if (value == undefined) {
        throw new IllegalStateException(message ?? "Required value was null.")
    }
    return value
}

/**
 * Throws an {@link IllegalStateException} with the given `message`.
 */
export const error = (message: unknown): never => {
    throw new IllegalStateException(toString(message))
}
