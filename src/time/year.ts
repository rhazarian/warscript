import { BinaryReader } from "../binaryreader"
import { BinaryWriter } from "../binarywriter"

const date = os.date

const cache: Record<number, Year | undefined> = setmetatable({}, { __mode: "v" })

/**
 * A year in the ISO-8601 calendar system, such as {@code 2007}.
 * <p>
 * {@code Year} is an immutable date-time object that represents a year.
 * Any field that can be derived from a year can be obtained.
 * <p>
 * <b>Note that years in the ISO chronology only align with years in the
 * Gregorian-Julian system for modern years. Parts of Russia did not switch to the
 * modern Gregorian/ISO rules until 1920.
 * As such, historical years must be treated with caution.</b>
 * <p>
 * This class does not store or represent a month, day, time or time-zone.
 * For example, the value "2007" can be stored in a {@code Year}.
 * <p>
 * Years represented by this class follow the ISO-8601 standard and use
 * the proleptic numbering system. Year 1 is preceded by year 0, then by year -1.
 * <p>
 * The ISO-8601 calendar system is the modern civil calendar system used today
 * in most of the world. It is equivalent to the proleptic Gregorian calendar
 * system, in which today's rules for leap years are applied for all time.
 * For most applications written today, the ISO-8601 rules are entirely suitable.
 * However, any application that makes use of historical dates, and requires them
 * to be accurate will find the ISO-8601 approach unsuitable.
 */
export class Year {
    /**
     * The minimum supported year, '-999,999,999'.
     */
    public static readonly MIN_VALUE = -999_999_999
    /**
     * The maximum supported year, '+999,999,999'.
     */
    public static readonly MAX_VALUE = 999_999_999

    private constructor(public readonly value: number) {
        assert(math.type(value) == "integer" && value >= Year.MIN_VALUE && value <= Year.MAX_VALUE)

        cache[value] = this
    }

    /**
     * Obtains the current year from the system clock in the default time-zone.
     * <p>
     * This will query the {@link os#date() system clock} in the default
     * time-zone to obtain the current year.
     *
     * @return the current year using the system clock and default time-zone
     */
    public static now(): Year {
        const value = date("*t").year
        return cache[value] ?? new Year(value)
    }

    /**
     * Obtains an instance of {@code Year}.
     * <p>
     * This method accepts a year value from the proleptic ISO calendar system.
     * <p>
     * The year 2AD/CE is represented by 2.<br>
     * The year 1AD/CE is represented by 1.<br>
     * The year 1BC/BCE is represented by 0.<br>
     * The year 2BC/BCE is represented by -1.<br>
     *
     * @param isoYear  the ISO proleptic year to represent, from {@code MIN_VALUE} to {@code MAX_VALUE}
     * @return the year
     */
    public static of(isoYear: number): Year {
        return cache[isoYear] ?? new Year(isoYear)
    }

    public static deserialize(reader: BinaryReader): Year {
        return Year.of(reader.readInt32())
    }

    public serialize(writer: BinaryWriter): void {
        writer.writeInt32(this.value)
    }

    /**
     * Checks if the year is a leap year, according to the ISO proleptic
     * calendar system rules.
     * <p>
     * This method applies the current rules for leap years across the whole time-line.
     * In general, a year is a leap year if it is divisible by four without
     * remainder. However, years divisible by 100, are not leap years, with
     * the exception of years divisible by 400 which are.
     * <p>
     * For example, 1904 is a leap year it is divisible by 4.
     * 1900 was not a leap year as it is divisible by 100, however 2000 was a
     * leap year as it is divisible by 400.
     * <p>
     * The calculation is proleptic - applying the same rules into the far future and far past.
     * This is historically inaccurate, but is correct for the ISO-8601 standard.
     *
     * @param year  the year to check
     * @return true if the year is leap, false otherwise
     */
    public static isLeap(year: number): boolean {
        return (year & 3) == 0 && (year % 100 != 0 || year % 400 == 0)
    }

    /**
     * Checks if the year is a leap year, according to the ISO proleptic
     * calendar system rules.
     * <p>
     * This method applies the current rules for leap years across the whole time-line.
     * In general, a year is a leap year if it is divisible by four without
     * remainder. However, years divisible by 100, are not leap years, with
     * the exception of years divisible by 400 which are.
     * <p>
     * For example, 1904 is a leap year it is divisible by 4.
     * 1900 was not a leap year as it is divisible by 100, however 2000 was a
     * leap year as it is divisible by 400.
     * <p>
     * The calculation is proleptic - applying the same rules into the far future and far past.
     * This is historically inaccurate, but is correct for the ISO-8601 standard.
     *
     * @return true if the year is leap, false otherwise
     */
    public get isLeap(): boolean {
        return Year.isLeap(this.value)
    }

    /**
     * Gets the length of this year in days.
     *
     * @return the length of this year in days, 365 or 366
     */
    public get length(): number {
        return this.isLeap ? 366 : 365
    }

    /**
     * Outputs this year as a {@code string}.
     *
     * @return a string representation of this year
     */
    public toString(): string {
        return this.value.toString()
    }

    private __lt(other: Year): boolean {
        return this.value < other.value
    }

    private __le(other: Year): boolean {
        return this.value <= other.value
    }
}
