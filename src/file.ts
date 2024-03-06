const preloader = Preloader

const abilityId = util.s2id("ANcl")
const maxPreloadSize = 259
const noDataMarker = "NO_DATA_PRESENT"

export function read(filename: string): string | undefined {
    BlzSetAbilityIcon(abilityId, noDataMarker)
    preloader(filename)
    const data = BlzGetAbilityIcon(abilityId)
    if (data == noDataMarker) {
        return undefined
    } else {
        return data
    }
}

function escapePreload(input: string): string {
    return string.format('")\n%s\n//', input)
}

const prelude = `
//! beginusercode
local o={}
local i=1
Preload=function(s)o[i]=s;i=i+1 end
PreloadEnd=function()end
//! endusercode
`

const postlude = string.format(
    `
//! beginusercode
BlzSetAbilityIcon(%s, table.concat(o))
//! endusercode
`,
    abilityId
)

export function writeRaw(filename: string, ...args: string[]): void {
    PreloadGenClear()
    PreloadGenStart()

    for (const [, content] of ipairs(args)) {
        for (const part of string.partition(content, maxPreloadSize)) {
            Preload(part)
        }
    }

    PreloadGenEnd(filename)
}

export function write(filename: string, content: string): void {
    PreloadGenClear()
    PreloadGenStart()

    Preload(escapePreload(prelude))
    for (const part of string.partition(content, maxPreloadSize)) {
        Preload(part)
    }
    Preload(escapePreload(postlude))

    PreloadGenEnd(filename)
}
