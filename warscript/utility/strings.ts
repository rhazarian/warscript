const concat = table.concat
const char = string.char
const find = string.find
const sub = string.sub

const oneCharUtf8CodePointPattern = `[%z${char(1)}-${char(127)}]`
const twoCharsUtf8CodePointPattern = `[${char(194)}-${char(223)}][${char(128)}-${char(191)}]`
const threeCharsUtf8CodePointPattern1 = `${char(224)}[${char(160)}-${char(191)}][${char(
    128
)}-${char(191)}]`
const threeCharsUtf8CodePointPattern2 = `[${char(225)}-${char(236)}][${char(128)}-${char(
    191
)}][${char(128)}-${char(191)}]`
const threeCharsUtf8CodePointPattern3 = `${char(237)}[${char(128)}-${char(159)}][${char(
    128
)}-${char(191)}]`
const threeCharsUtf8CodePointPattern4 = `[${char(238)}-${char(239)}][${char(128)}-${char(
    191
)}][${char(128)}-${char(191)}]`
const fourCharsUtf8CodePointPattern1 = `${char(240)}[${char(144)}-${char(191)}][${char(128)}-${char(
    191
)}][${char(128)}-${char(191)}]`
const fourCharsUtf8CodePointPattern2 = `[${char(241)}-${char(243)}][${char(128)}-${char(
    191
)}][${char(128)}-${char(191)}][${char(128)}-${char(191)}]`
const fourCharsUtf8CodePointPattern3 = `${char(244)}[${char(128)}-${char(143)}][${char(128)}-${char(
    191
)}][${char(128)}-${char(191)}]`

export const filterUtf8 = (str: string): string => {
    const len = str.length

    let validUtf8Substrings: string[] | undefined = undefined
    let validUtf8SubstringsNextLuaIndex = 1
    let validUtf8SubstringStartLuaIndex = 1

    let i = 1
    while (i <= len) {
        if (i == find(str, oneCharUtf8CodePointPattern, i)[0]) {
            i += 1
        } else if (i == find(str, twoCharsUtf8CodePointPattern, i)[0]) {
            i += 2
        } else if (
            i == find(str, threeCharsUtf8CodePointPattern1, i)[0] ||
            i == find(str, threeCharsUtf8CodePointPattern2, i)[0] ||
            i == find(str, threeCharsUtf8CodePointPattern3, i)[0] ||
            i == find(str, threeCharsUtf8CodePointPattern4, i)[0]
        ) {
            i += 3
        } else if (
            i == find(str, fourCharsUtf8CodePointPattern1, i)[0] ||
            i == find(str, fourCharsUtf8CodePointPattern2, i)[0] ||
            i == find(str, fourCharsUtf8CodePointPattern3, i)[0]
        ) {
            i += 4
        } else {
            validUtf8Substrings = validUtf8Substrings ?? []
            validUtf8Substrings[validUtf8SubstringsNextLuaIndex - 1] = sub(
                str,
                validUtf8SubstringStartLuaIndex,
                i - 1
            )
            validUtf8SubstringsNextLuaIndex += 1
            i += 1
            validUtf8SubstringStartLuaIndex = i
        }
    }
    if (validUtf8Substrings != undefined) {
        validUtf8Substrings[validUtf8SubstringsNextLuaIndex - 1] = sub(
            str,
            validUtf8SubstringStartLuaIndex
        )
        return concat(validUtf8Substrings)
    }
    return str
}
