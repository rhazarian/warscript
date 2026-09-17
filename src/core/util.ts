/** @noselfinfile */

declare global {
    interface Destroyable {
        destroy(): void
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace ns {
    /**
     * Converts a numeric rawid into its string representation.
     */
    export function id2s(id: number | string): string {
        if (typeof id == "string") {
            return id
        } else {
            return string.pack(">I4", id)
        }
    }

    /**
     * Converts a string rawid into its numeric representation.
     */
    export function s2id(id: string | number): number {
        if (typeof id == "number") {
            return id
        } else {
            const [numid] = string.unpack(">I4", id.padEnd(4, "\0"))
            return numid
        }
    }

    ;(_G as any).__contexts = (_G as any).__contexts || {}
    const contexts = (_G as any).__contexts as { [id: string]: any }

    /**
     * Creates a "context" object unique to the specified id,
     * that will stay the same even across map reloads.
     */
    export function context<T>(id: string, initial: T): T {
        contexts[id] = contexts[id] || initial
        return contexts[id]
    }

    /**
     * Same as @see context , but uses a closure to compute the
     * context value. The closure will be ran exactly once for
     * each unique id.
     */
    export function contextFn<T>(id: string, initializer: () => T): T {
        if (contexts[id] != null) {
            return contexts[id]
        } else {
            const v = initializer()
            contexts[id] = v
            return v
        }
    }

    /**
     * Clones an array, preserving order.
     */
    export function cloneArray<T>(array: readonly T[]): T[] {
        const clone: T[] = []
        for (const i of $range(1, array.length)) {
            clone[i - 1] = array[i - 1]
        }
        return clone
    }
}

declare global {
    // eslint-disable-next-line no-var
    var util: typeof ns
}
globalThis.util = ns

{
    const ceil = math.ceil
    const sub = string.sub

    _G.string.partition = function (s: string, length: number): string[] {
        const list: string[] = []
        let i = 1
        for (const pos of $range(0, (ceil(s.length / length) - 1) * length, length)) {
            list[i - 1] = sub(s, pos + 1, pos + length)
            ++i
        }
        return list
    }
}

declare global {
    interface String {
        /**
         * Partitions a string into equal-sized chunks. The last chunk may be smaller if
         * the string is not equally divisible by the specified length.
         *
         * @param length size of chunk
         */
        partition(length: number): string[]
    }
}

type KeysOfType<T, U> = {
    [P in Exclude<keyof T, "hook">]: T[P] extends U ? P : never
}[Exclude<keyof T, "hook">]

declare global {
    function hook<
        P extends KeysOfType<
            typeof globalThis,
            Exclude<(...args: any[]) => void, Record<string, unknown>>
        >,
    >(p: P, hook: (...args: Parameters<(typeof globalThis)[P]>) => void): void
}

{
    const hooks: {
        [P in Exclude<
            KeysOfType<typeof globalThis, (this: void, ...args: any[]) => any>,
            "hook"
        >]?: any[]
    } = {}

    function hook<
        P extends KeysOfType<
            typeof globalThis,
            Exclude<(this: void, ...args: any[]) => void, Record<string, unknown>>
        >,
    >(p: P, hook: (this: void, ...args: Parameters<(typeof globalThis)[P]>) => void): void {
        let list = hooks[p]
        if (!list) {
            list = []
            globalThis[p] = hooked(globalThis[p], list as any) as any
            hooks[p] = list
        }
        list[list.length] = hook
    }

    function hooked<T extends (this: void, ...args: any[]) => any>(
        func: T,
        hooks: ((this: void, ...args: Parameters<T>) => void)[],
    ): (this: void, ...args: Parameters<T>) => ReturnType<T> {
        return (...args: Parameters<T>): ReturnType<T> => {
            const result = func(...args)
            for (const i of $range(1, hooks.length)) {
                hooks[i - 1](...args)
            }
            return result
        }
    }

    globalThis.hook = hook
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
    function fourCC(id: string): number
}

macro_define("fourCC", (id: string) => {
    return `${util.s2id(id)} `
})

globalThis.fourCC = util.s2id

namespace inner {
    /** @deprecated Use the {@link OrderType} const enum from `warscript/engine/object-data/auxiliary/order-type` instead. */
    export const orderId = (function () {
        const orders = {
            absorb: 852529,
            acidbomb: 852662,
            acolyteharvest: 852185,
            AImove: 851988,
            ambush: 852131,
            ancestralspirit: 852490,
            ancestralspirittarget: 852491,
            animatedead: 852217,
            antimagicshell: 852186,
            attack: 851983,
            attackground: 851984,
            attackonce: 851985,
            attributemodskill: 852576,
            auracalltoarms: 852688,
            auraunholy: 852215,
            auravampiric: 852216,
            autodispel: 852132,
            autodispeloff: 852134,
            autodispelon: 852133,
            autoentangle: 852505,
            autoentangleinstant: 852506,
            autoharvestgold: 852021,
            autoharvestlumber: 852022,
            avatar: 852086,
            avengerform: 852531,
            awaken: 852466,
            banish: 852486,
            barkskin: 852135,
            barkskinoff: 852137,
            barkskinon: 852136,
            batteringram: 852705,
            battleroar: 852599,
            battlestations: 852099,
            bearform: 852138,
            berserk: 852100,
            blackarrow: 852577,
            blackarrowoff: 852579,
            blackarrowon: 852578,
            bladedance: 852698,
            blight: 852187,
            blink: 852525,
            blizzard: 852089,
            bloodlust: 852101,
            bloodlustoff: 852103,
            bloodluston: 852102,
            board: 852043,
            breathoffire: 852580,
            breathoffrost: 852560,
            build: 851994,
            burrow: 852533,
            cannibalize: 852188,
            carrionscarabs: 852551,
            carrionscarabsinstant: 852554,
            carrionscarabsoff: 852553,
            carrionscarabson: 852552,
            carrionswarm: 852218,
            chainlightning: 852119,
            challengingcall: 852520,
            channel: 852600,
            charm: 852581,
            chemicalrage: 852663,
            cleansingfire: 852704,
            cloudoffog: 852473,
            clusterrockets: 852652,
            coldarrows: 852244,
            coldarrowstarg: 852243,
            consecration: 852702,
            controlmagic: 852474,
            corporealform: 852493,
            corrosivebreath: 852140,
            coupleinstant: 852508,
            coupletarget: 852507,
            creepanimatedead: 852246,
            creepdevour: 852247,
            creepheal: 852248,
            creephealoff: 852250,
            creephealon: 852249,
            creepthunderbolt: 852252,
            creepthunderclap: 852253,
            cripple: 852189,
            curse: 852190,
            curseoff: 852192,
            curseon: 852191,
            cyclone: 852144,
            darkconversion: 852228,
            darkportal: 852229,
            darkritual: 852219,
            darksummoning: 852220,
            deathanddecay: 852221,
            deathcoil: 852222,
            deathpact: 852223,
            deathseekerbow: 852710,
            decouple: 852509,
            defend: 852055,
            detectaoe: 852015,
            detonate: 852145,
            devour: 852104,
            devourmagic: 852536,
            disassociate: 852240,
            disenchant: 852495,
            dismount: 852470,
            dispel: 852057,
            divineshield: 852090,
            doom: 852583,
            drain: 852487,
            dreadlordinferno: 852224,
            dropitem: 852001,
            moveslot0: 852002,
            moveslot1: 852003,
            moveslot2: 852004,
            moveslot3: 852005,
            moveslot4: 852006,
            moveslot5: 852007,
            useslot0: 852008,
            useslot1: 852009,
            useslot2: 852010,
            useslot3: 852011,
            useslot4: 852012,
            useslot5: 852013,
            moveslotext0: 852714,
            moveslotext1: 852715,
            moveslotext2: 852716,
            moveslotext3: 852717,
            moveslotext4: 852718,
            moveslotext5: 852719,
            moveslotext6: 852720,
            moveslotext7: 852721,
            moveslotext8: 852722,
            moveslotext9: 852723,
            moveslotext10: 852724,
            moveslotext11: 852725,
            moveslotext12: 852726,
            moveslotext13: 852727,
            moveslotext14: 852728,
            moveslotext15: 852729,
            moveslotext16: 852730,
            moveslotext17: 852731,
            moveslotext18: 852732,
            moveslotext19: 852733,
            moveslotext20: 852734,
            moveslotext21: 852735,
            moveslotext22: 852736,
            moveslotext23: 852737,
            moveslotext24: 852738,
            moveslotext25: 852739,
            moveslotext26: 852740,
            moveslotext27: 852741,
            moveslotext28: 852742,
            moveslotext29: 852743,
            moveslotequip0: 852744,
            moveslotequip1: 852745,
            moveslotequip2: 852746,
            moveslotequip3: 852747,
            moveslotequip4: 852748,
            moveslotequip5: 852749,
            moveslotequip6: 852750,
            moveslotequip7: 852751,
            moveslotequip8: 852752,
            useslotext0: 852771,
            useslotext1: 852772,
            useslotext2: 852773,
            useslotext3: 852774,
            useslotext4: 852775,
            useslotext5: 852776,
            useslotext6: 852777,
            useslotext7: 852778,
            useslotext8: 852779,
            useslotext9: 852780,
            useslotext10: 852781,
            useslotext11: 852782,
            useslotext12: 852783,
            useslotext13: 852784,
            useslotext14: 852785,
            useslotext15: 852786,
            useslotext16: 852787,
            useslotext17: 852788,
            useslotext18: 852789,
            useslotext19: 852790,
            useslotext20: 852791,
            useslotext21: 852792,
            useslotext22: 852793,
            useslotext23: 852794,
            useslotext24: 852795,
            useslotext25: 852796,
            useslotext26: 852797,
            useslotext27: 852798,
            useslotext28: 852799,
            useslotext29: 852800,
            useslotequip0: 852801,
            useslotequip1: 852802,
            useslotequip2: 852803,
            useslotequip3: 852804,
            useslotequip4: 852805,
            useslotequip5: 852806,
            useslotequip6: 852807,
            useslotequip7: 852808,
            useslotequip8: 852809,
            drunkenhaze: 852585,
            earthquake: 852121,
            eattree: 852146,
            elementalfury: 852586,
            ensnare: 852106,
            ensnareaoe: 852687,
            ensnareoff: 852108,
            ensnareon: 852107,
            entangle: 852147,
            entangleinstant: 852148,
            entanglingroots: 852171,
            etherealform: 852496,
            evileye: 852105,
            faeriefire: 852149,
            faeriefireoff: 852151,
            faeriefireon: 852150,
            fanofknives: 852526,
            farsight: 852122,
            fingerofdeath: 852230,
            firebolt: 852231,
            flamestrike: 852488,
            flamingarrows: 852174,
            flamingarrowstarg: 852173,
            flamingattack: 852540,
            flamingattacktarg: 852539,
            flare: 852060,
            forceboard: 852044,
            forceofnature: 852176,
            forkedlightning: 852587,
            freezingbreath: 852195,
            frenzy: 852561,
            frenzyoff: 852563,
            frenzyon: 852562,
            frostarmor: 852225,
            frostarmoroff: 852459,
            frostarmoron: 852458,
            frostnova: 852226,
            getitem: 851981,
            gold2lumber: 852233,
            grabtree: 852511,
            grit: 852693,
            guidinghand: 852695,
            harvest: 852018,
            headsplitter: 852691,
            heal: 852063,
            healingspray: 852664,
            healingward: 852109,
            healingwave: 852501,
            healoff: 852065,
            healon: 852064,
            heroicchallenge: 852694,
            heroicslash: 852684,
            hex: 852502,
            holdposition: 851993,
            holybolt: 852092,
            howlofterror: 852588,
            humanbuild: 851995,
            immolation: 852177,
            impale: 852555,
            incineratearrow: 852670,
            incineratearrowoff: 852672,
            incineratearrowon: 852671,
            inferno: 852232,
            innerfire: 852066,
            innerfireoff: 852068,
            innerfireon: 852067,
            inspirecourage: 852689,
            instant: 852200,
            invisibility: 852069,
            lavamonster: 852667,
            lightningshield: 852110,
            load: 852046,
            loadarcher: 852142,
            loadcorpse: 852050,
            loadcorpseinstant: 852053,
            locustswarm: 852556,
            lumber2gold: 852234,
            magicdefense: 852478,
            magicleash: 852480,
            magicundefense: 852479,
            manaburn: 852179,
            manaflareoff: 852513,
            manaflareon: 852512,
            manashieldoff: 852590,
            manashieldon: 852589,
            massteleport: 852093,
            mechanicalcritter: 852564,
            metamorphosis: 852180,
            militia: 852072,
            militiaconvert: 852071,
            militiaoff: 852073,
            militiaunconvert: 852651,
            mindrot: 852565,
            mirrorimage: 852123,
            monsoon: 852591,
            mount: 852469,
            mounthippogryph: 852143,
            move: 851986,
            nagabuild: 852467,
            neutraldetectaoe: 852023,
            neutralinteract: 852566,
            neutralspell: 852630,
            nightelfbuild: 851997,
            orcbuild: 851996,
            parasite: 852601,
            parasiteoff: 852603,
            parasiteon: 852602,
            patrol: 851990,
            AIpatrol: 851991,
            phaseshift: 852514,
            phaseshiftinstant: 852517,
            phaseshiftoff: 852516,
            phaseshifton: 852515,
            phoenixfire: 852481,
            phoenixmorph: 852482,
            poisonarrows: 852255,
            poisonarrowstarg: 852254,
            polymorph: 852074,
            possession: 852196,
            preservation: 852568,
            purge: 852111,
            purifierblade: 852707,
            rainofchaos: 852237,
            rainoffire: 852238,
            raisedead: 852197,
            raisedeadoff: 852199,
            raisedeadon: 852198,
            ravenform: 852155,
            recharge: 852157,
            rechargeoff: 852159,
            rechargeon: 852158,
            rejuvination: 852160,
            renew: 852161,
            renewoff: 852163,
            renewon: 852162,
            repair: 852024,
            repairoff: 852026,
            repairon: 852025,
            replenish: 852542,
            replenishlife: 852545,
            replenishlifeoff: 852547,
            replenishlifeon: 852546,
            replenishmana: 852548,
            replenishmanaoff: 852550,
            replenishmanaon: 852549,
            replenishoff: 852544,
            replenishon: 852543,
            request_hero: 852239,
            requestsacrifice: 852201,
            restoration: 852202,
            restorationoff: 852204,
            restorationon: 852203,
            resumebuild: 851999,
            resumeharvesting: 852017,
            resurrection: 852094,
            returnresources: 852020,
            revenge: 852241,
            revive: 852039,
            righteousfury: 852706,
            ritualdagger: 852674,
            roar: 852164,
            robogoblin: 852656,
            root: 852165,
            sacrifice: 852205,
            sanctuary: 852569,
            scout: 852181,
            selfdestruct: 852040,
            selfdestructoff: 852042,
            selfdestructon: 852041,
            sentinel: 852182,
            follow: 851970,
            smart: 851971,
            setrally: 851980,
            shadowsight: 852570,
            shadowstrike: 852527,
            shockwave: 852125,
            silence: 852592,
            sleep: 852227,
            slow: 852075,
            slowoff: 852077,
            slowon: 852076,
            soulburn: 852668,
            soullantern: 852708,
            soulpreservation: 852242,
            spellshield: 852571,
            spellshieldaoe: 852572,
            spellsteal: 852483,
            spellstealoff: 852485,
            spellstealon: 852484,
            spies: 852235,
            spiritlink: 852499,
            spiritofvengeance: 852528,
            spirittroll: 852573,
            spiritwolf: 852126,
            stampede: 852593,
            standdown: 852113,
            starfall: 852183,
            stasistrap: 852114,
            steal: 852574,
            stomp: 852127,
            stoneform: 852206,
            stop: 851972,
            stunned: 851973,
            submerge: 852604,
            summonfactory: 852658,
            summongrizzly: 852594,
            summonphoenix: 852489,
            summonquillbeast: 852595,
            summonwareagle: 852596,
            sweepingstrike: 852680,
            tankdroppilot: 852079,
            tankloadpilot: 852080,
            tankpilot: 852081,
            taunt: 852520,
            thunderbolt: 852095,
            thunderclap: 852096,
            tornado: 852597,
            townbelloff: 852083,
            townbellon: 852082,
            tranquility: 852184,
            transmute: 852665,
            unavatar: 852087,
            unavengerform: 852532,
            unbearform: 852139,
            unburrow: 852534,
            uncoldarrows: 852245,
            uncorporealform: 852494,
            undeadbuild: 851998,
            undeadvengeance: 852703,
            undefend: 852056,
            undivineshield: 852091,
            unetherealform: 852497,
            unflamingarrows: 852175,
            unflamingattack: 852541,
            unguidinghand: 852696,
            unholyfrenzy: 852209,
            unholyfrenzyaoe: 852675,
            unimmolation: 852178,
            unload: 852047,
            unloadall: 852048,
            unloadallcorpses: 852054,
            unloadallinstant: 852049,
            unpoisonarrows: 852256,
            unravenform: 852156,
            unrobogoblin: 852657,
            unroot: 852166,
            unsoullantern: 852709,
            unstableconcoction: 852500,
            unstoneform: 852207,
            unsubmerge: 852605,
            unsummon: 852210,
            unwindwalk: 852130,
            valiantcharge: 852685,
            vengeance: 852521,
            vengeanceinstant: 852524,
            vengeanceoff: 852523,
            vengeanceon: 852522,
            volcano: 852669,
            voodoo: 852503,
            warcry: 852701,
            ward: 852504,
            waterelemental: 852097,
            wateryminion: 852598,
            web: 852211,
            weboff: 852213,
            webon: 852212,
            whirlwind: 852128,
            windwalk: 852129,
            wispharvest: 852214,
            witheringfire: 852711,
        }
        return (id: keyof typeof orders) => {
            return orders[id] ?? 0
        }
    })()
}

declare global {
    /** @deprecated Use the {@link OrderType} const enum from `warscript/engine/object-data/auxiliary/order-type` instead. */
    function orderId(...args: Parameters<typeof inner.orderId>): ReturnType<typeof inner.orderId>
}

globalThis.orderId = inner.orderId

macro_define("orderId", (...args: Parameters<typeof orderId>) => {
    return `${orderId(...args)} `
})

export {}
