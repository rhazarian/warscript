import { BinaryReader } from "../binaryreader"
import { BinaryWriter } from "../binarywriter"

import { DayOfWeek } from "./dayOfWeek"
import { Month } from "./month"

import { LocalDate } from "./localDate"
import { LocalTime } from "./localTime"

const date = os.date
const pack = string.pack

const cache: Record<string, LocalDateTime | undefined> = {}

export class LocalDateTime {
    private constructor(
        private readonly date: LocalDate,
        private readonly time: LocalTime,
        private readonly key: string
    ) {
        cache[key] = this
    }

    public static now(this: void): LocalDateTime {
        const info = date("*t")
        return LocalDateTime.of(info.year, info.month, info.day, info.hour, info.min, info.sec)
    }

    /**
     * Obtains an instance of {@code LocalDateTime} from year, month,
     * day, hour, minute and second.
     * <p>
     * This returns a {@code LocalDateTime} with the specified year, month,
     * day-of-month, hour and minute.
     * The day must be valid for the year and month, otherwise an exception will be thrown.
     *
     * @param year  the year to represent, from MIN_YEAR to MAX_YEAR
     * @param month  the month-of-year to represent
     * @param dayOfMonth  the day-of-month to represent, from 1 to 31
     * @param hour  the hour-of-day to represent, from 0 to 23
     * @param minute  the minute-of-hour to represent, from 0 to 59
     * @param second  the second-of-minute to represent, from 0 to 59
     * @return the local date-time
     */
    public static of(
        year: number,
        month: number | Month,
        dayOfMonth: number,
        hour: number,
        minute: number,
        second?: number
    ): LocalDateTime {
        month = typeof month == "number" ? month : month.value
        const key = pack(">i4BBBBB", year, month, dayOfMonth, hour, minute, second)
        return (
            cache[key] ??
            new LocalDateTime(
                LocalDate.of(year, month, dayOfMonth),
                LocalTime.of(hour, minute, second),
                key
            )
        )
    }

    /**
     * Obtains an instance of {@code LocalDateTime} using seconds from the
     * epoch of 1970-01-01T00:00:00Z.
     *
     * @param epochSecond  the number of seconds from the epoch of 1970-01-01T00:00:00Z
     * @return the local date-time
     */
    public static ofEpochSecond(epochSecond: number): LocalDateTime {
        const info = date("*t", epochSecond)
        return LocalDateTime.of(info.year, info.month, info.day, info.hour, info.min, info.sec)
    }

    public static deserialize(reader: BinaryReader): LocalDateTime {
        return LocalDateTime.of(
            reader.readInt32(),
            reader.readUInt8(),
            reader.readUInt8(),
            reader.readUInt8(),
            reader.readUInt8(),
            reader.readUInt8()
        )
    }

    public serialize(writer: BinaryWriter): void {
        writer.writeBytes(this.key)
    }

    /**
     * Gets the {@code LocalDate} part of this date-time.
     * <p>
     * This returns a {@code LocalDate} with the same year, month and day
     * as this date-time.
     *
     * @return the date part of this date-time
     */
    public toLocalDate(): LocalDate {
        return this.date
    }

    /**
     * Gets the year field.
     * <p>
     * This method returns the primitive {@code number} value for the year.
     *
     * @return the year, from MIN_YEAR to MAX_YEAR
     */
    public get year(): number {
        return this.date.year
    }

    /**
     * Gets the month-of-year field using the {@code Month} enum.
     * <p>
     * This method returns the class {@link Month} for the month.
     *
     * @return the month-of-year
     */
    public get month(): Month {
        return this.date.month
    }

    /**
     * Gets the day-of-month field.
     * <p>
     * This method returns the primitive {@code number} value for the day-of-month.
     *
     * @return the day-of-month, from 1 to 31
     */
    public get dayOfMonth(): number {
        return this.date.dayOfMonth
    }

    /**
     * Gets the day-of-year field.
     * <p>
     * This method returns the primitive {@code number} value for the day-of-year.
     *
     * @return the day-of-year, from 1 to 365, or 366 in a leap year
     */
    public get dayOfYear(): number {
        return this.date.dayOfYear
    }

    /**
     * Gets the day-of-week field, which is a class {@code DayOfWeek}.
     * <p>
     * This method returns the class {@link DayOfWeek} for the day-of-week.
     *
     * @return the day-of-week
     */
    public get dayOfWeek(): DayOfWeek {
        return this.date.dayOfWeek
    }

    /**
     * Gets the {@code LocalTime} part of this date-time.
     * <p>
     * This returns a {@code LocalTime} with the same hour, minute, second and
     * nanosecond as this date-time.
     *
     * @return the time part of this date-time
     */
    public toLocalTime(): LocalTime {
        return this.time
    }

    /**
     * Gets the hour-of-day field.
     *
     * @return the hour-of-day, from 0 to 23
     */
    public get hour(): number {
        return this.time.hour
    }

    /**
     * Gets the minute-of-hour field.
     *
     * @return the minute-of-hour, from 0 to 59
     */
    public get minute(): number {
        return this.time.minute
    }

    /**
     * Gets the second-of-minute field.
     *
     * @return the second-of-minute, from 0 to 59
     */
    public get second(): number {
        return this.time.second
    }

    /**
     * Outputs this date-time as a {@code String}, such as {@code 2007-12-03T10:15:30}.
     * <p>
     * The output will be one of the following ISO-8601 formats:
     * <ul>
     * <li>{@code uuuu-MM-dd'T'HH:mm}</li>
     * <li>{@code uuuu-MM-dd'T'HH:mm:ss}</li>
     * </ul>
     * The format used will be the shortest that outputs the full value of
     * the time where the omitted parts are implied to be zero.
     *
     * @return a string representation of this date-time
     */
    public toString(): string {
        return this.date.toString() + "T" + this.time.toString()
    }

    private __lt(other: LocalDateTime): boolean {
        return this.date <= other.date && (this.date != other.date || this.time < other.time)
    }

    private __le(other: LocalDateTime): boolean {
        return this.date <= other.date && (this.date != other.date || this.time <= other.time)
    }
}
