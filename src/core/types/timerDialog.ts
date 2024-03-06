import { Color } from "./color"
import { Timer } from "./timer"
import { Handle, HandleDestructor } from "./handle"

const createTimerDialog = CreateTimerDialog
const destroyTimerDialog = DestroyTimerDialog
const timerDialogSetTitle = TimerDialogSetTitle
const timerDialogSetTitleColor = TimerDialogSetTitleColor
const timerDialogSetTimeColor = TimerDialogSetTimeColor
const isTimerDialogDisplayed = IsTimerDialogDisplayed
const timerDialogDisplay = TimerDialogDisplay

export class TimerDialog extends Handle<jtimerdialog> {
    private _title?: string
    private _titleColor?: Color
    private _timeColor?: Color

    protected override onDestroy(): HandleDestructor {
        destroyTimerDialog(this.handle)
        return super.onDestroy()
    }

    public get title(): string {
        return this._title ?? ""
    }

    public set title(v: string) {
        timerDialogSetTitle(this.handle, v)
        this._title = v
    }

    public get titleColor(): Color {
        return this._titleColor ?? Color.white
    }

    public set titleColor(v: Color) {
        timerDialogSetTitleColor(this.handle, v.r, v.g, v.b, v.a)
        this._titleColor = v
    }

    public get timeColor(): Color {
        return this._timeColor ?? Color.white
    }

    public set timeColor(v: Color) {
        timerDialogSetTimeColor(this.handle, v.r, v.g, v.b, v.a)
        this._timeColor = v
    }

    public get visible(): boolean {
        return isTimerDialogDisplayed(this.handle)
    }

    public set visible(v: boolean) {
        timerDialogDisplay(this.handle, v)
    }

    public static create(timer: Timer): TimerDialog {
        return TimerDialog.of(createTimerDialog(timer.handle))
    }
}
