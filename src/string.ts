const error = _G.error
const tonumber = _G.tonumber
const match = string.match
const sub = string.sub

declare global {
    interface String {
        /**
         * If this string starts with the given prefix, returns a copy of this string with the prefix removed.
         * Otherwise, returns this string.
         */
        removePrefix(prefix: string): string
    }

    namespace string {
        /**
         * If the string starts with the given prefix, returns a copy of the string with the prefix removed.
         * Otherwise, returns the string.
         */
        function removePrefix(string: string, prefix: string): string
    }
}

_G.string.removePrefix = function (string: string, prefix: string): string {
    const prefixLength = prefix.length
    return sub(string, 1, prefixLength) == prefix ? sub(string, prefixLength + 1) : string
}

declare global {
    namespace string {
        /**
         * If the string ends with the given suffix, returns a copy of the string with the suffix removed.
         * Otherwise, returns the string.
         */
        function removeSuffix(string: string, prefix: string): string
    }

    interface String {
        /**
         * If this string ends with the given suffix, returns a copy of this string with the suffix removed.
         * Otherwise, returns this string.
         */
        removeSuffix(suffix: string): string
    }
}

_G.string.removeSuffix = function (string: string, suffix: string): string {
    const suffixLength = suffix.length
    return sub(string, -suffixLength) == suffix ? sub(string, 1, -suffixLength - 1) : string
}

declare global {
    interface String {
        /**
         * Parses the string as a number and returns the result or null if the string is not a valid representation of a number.
         */
        toNumberOrNull(): number | undefined
    }

    namespace string {
        /**
         * Parses the string as a number and returns the result or null if the string is not a valid representation of a number.
         */
        function toNumberOrNull(string: string): number | undefined
    }
}

_G.string.toNumberOrNull = function (string: string): number | undefined {
    return tonumber(string)
}

declare global {
    interface String {
        /**
         * Parses the string as a number and returns the result.
         */
        toNumber(): number
    }

    namespace string {
        /**
         * Parses the string as a number and returns the result.
         */
        function toNumber(string: string): number
    }
}

_G.string.toNumber = function (string: string): number {
    return tonumber(string) ?? error(`'${string}' is not a valid representation of a number.`)
}

declare global {
    interface String {
        /**
         * Returns index of the last character matching the given predicate,
         * or -1 if the char sequence does not contain such character.
         */
        indexOfLast(predicate: (char: string) => boolean): number
    }

    namespace string {
        /**
         * Returns index of the last character matching the given predicate,
         * or -1 if the char sequence does not contain such character.
         */
        function indexOfLast(string: string, predicate: (char: string) => boolean): number
    }
}

_G.string.indexOfLast = function (string: string, predicate: (char: string) => boolean): number {
    for (const i of $range(string.length, 1, -1)) {
        if (predicate(sub(string, i, i))) {
            return i - 1
        }
    }
    return -1
}

declare global {
    interface String {
        /**
         * Returns `true` if this string is empty or consists solely of whitespace characters.
         */
        isBlank(): boolean
    }

    namespace string {
        /**
         * Returns `true` if this string is empty or consists solely of whitespace characters.
         */
        function isBlank(string: string): boolean
    }
}

_G.string.isBlank = function (string: string): boolean {
    return match(string, "^%s*$")[0] != undefined
}

declare global {
    interface String {
        /**
         * Returns `true` if this string is not empty and contains some characters except of whitespace characters.
         */
        isNotBlank(): boolean
    }

    namespace string {
        /**
         * Returns `true` if this string is not empty and contains some characters except of whitespace characters.
         */
        function isNotBlank(string: string): boolean
    }
}

_G.string.isNotBlank = function (string: string): boolean {
    return match(string, "^%s*$")[0] == undefined
}

declare global {
    namespace string {
        /**
         * Returns the number of characters matching the given predicate.
         */
        function count(string: string, predicate: (char: string) => boolean): number
    }

    interface String {
        /**
         * Returns the number of characters matching the given predicate.
         */
        count(predicate: (char: string) => boolean): number
    }
}

_G.string.count = function (string: string, predicate: (char: string) => boolean): number {
    let result = 0
    for (const i of $range(1, string.length)) {
        if (predicate(sub(string, i, i))) {
            ++result
        }
    }
    return result
}

export {}
