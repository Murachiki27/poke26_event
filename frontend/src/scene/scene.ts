import  {type Screen} from "../graphics/screen.ts";
import { createWindow, deleteWindow, isMsgBoxEnded, resetMsgBoxState, setActiveWindow, setMsgBoxLines, setMsgBoxVisible } from "../sys/msgbox.ts";

import { getSpriteSheet } from '../data/sheet.ts';
import type { DefferedConst } from "../util/ref.ts";
import { UIButton, UIInput, UISelector, type UIButtonOption, type UIInputOption, type UISelectorOption } from "../sys/uibase.ts";
import { AUDIO } from "../audio/audio.ts";

const binSheetOp = getSpriteSheet('OP');

export abstract class Event {
    private initialized = false;
    public isInitialized(): boolean {
        if (this.initialized) {
            return true;
        }
        this.initialized = true;
        return false;
    }

    public render(screen: Screen): void {}

    public onStart(screen: Screen, scene: Scene, now: number): void {}
    public onUpdate(screen: Screen, now: number): void {}
    public abstract continueUpdate(screen: Screen): boolean;
    public onEnd(): void {}

    public onClick(screen: Screen): void {}
}

export function wait(waitFunc: (screen: Screen) => boolean): WaitEvent {
    return new WaitEvent(waitFunc);
};

class WaitEvent extends Event {
    private waitFunc: (screen: Screen) => boolean;
    
    constructor(waitFunc: (screen: Screen) => boolean) {
        super();
        this.waitFunc = waitFunc;
    }

    public continueUpdate(screen: Screen): boolean {
        return this.waitFunc(screen);
    }
}

export function messageFunc(linesFunc: (screen: Screen) => string[], afterShowing: boolean = false): MessageEvent {
    return new MessageEvent(linesFunc, afterShowing);
}

export function message(lines: string[], afterShowing: boolean = false): MessageEvent {
    return new MessageEvent(() => lines, afterShowing);
}

class MessageEvent extends Event {
    private readonly linesFunc: (screen: Screen) => string[];
    private readonly afterShowing: boolean;

    constructor(linesFunc: (screen: Screen) => string[], afterShowing: boolean) {
        super();
        this.linesFunc = linesFunc;
        this.afterShowing = afterShowing;
    }

    onStart(screen: Screen, scene: Scene, now: number) {
        resetMsgBoxState();
        setMsgBoxLines(...this.linesFunc(screen));
        setMsgBoxVisible(true);
    }

    onEnd() {
        if (!this.afterShowing) {
            setMsgBoxVisible(false);
        }
    }

    continueUpdate(screen: Screen): boolean {
        return !isMsgBoxEnded();
    }
}

export function timer(tickLength: number, updatepAction: UpdateAction | null = null, startAction: StartAction | null = null, endAction: EndAction | null = null): TimeEvent {
    return new TimeEvent(tickLength, updatepAction, startAction, endAction);
}

export type UpdateAction = (ticks: number) => void;
export type StartAction = () => void;
export type EndAction = () => void;
class TimeEvent extends Event {
    private readonly tickLength: number;
    private readonly updatepAction: UpdateAction | null;
    private readonly startAction: StartAction | null;
    private readonly endAction: EndAction | null;
    private ticks: number = 0;

    constructor(tickLength: number, updatepAction: UpdateAction | null, startAction: StartAction | null, endAction: EndAction | null) {
        super();
        this.tickLength = tickLength;
        this.updatepAction = updatepAction;
        this.startAction = startAction;
        this.endAction = endAction;
    }

    public onStart(screen: Screen, scene: Scene, now: number) {
        this.ticks = 0;
        this.startAction?.();
    }

    public onUpdate(screen: Screen, now: number): void {
        if (this.ticks < this.tickLength) {
            this.ticks++;
            this.updatepAction?.(this.ticks);
        }
    }

    public onEnd(): void {
        this.endAction?.();
    }

    public continueUpdate(screen: Screen): boolean {
        return this.ticks < this.tickLength;
    }
}

type UIEventOption = {
    showAfter?: boolean;
};

export type UISelectorEventOption = UISelectorOption & UIEventOption;

export function selectorFunc(optionFunc: (screen: Screen) => UISelectorEventOption, selectAction: SelectAction): SelectorEvent {
    return new SelectorEvent(optionFunc, selectAction);
}

export function selector(option: UISelectorEventOption, selectAction: SelectAction): SelectorEvent {
    return new SelectorEvent(() => option, selectAction);
}

export type SelectAction = (index: number, elId: number) => void;
class SelectorEvent extends Event {
    private window: UISelector | null = null;
    private optionFunc: (screen: Screen) => UISelectorEventOption;
    private selectAction: SelectAction;
    private showAfter: boolean | undefined;
    private id: number = -1;

    constructor(optionFunc: (screen: Screen) => UISelectorEventOption, selectAction: SelectAction) {
        super();
        this.optionFunc = optionFunc;
        this.selectAction = selectAction;
    }

    public onStart(screen: Screen, scene: Scene, now: number): void {
        const opt = this.optionFunc(screen);
        this.window = new UISelector(opt);
        this.id = createWindow(this.window);
        this.showAfter = opt.showAfter;
        setActiveWindow(this.id);
    }

    public onEnd(): void {
        this.selectAction(this.window!.getSelectIndex(), this.id);
        if (!this.showAfter) {
            deleteWindow(this.id);
        }
        this.id = -1;
    }

    public continueUpdate(screen: Screen): boolean {
        return !this.window!.isSelected();
    }
}

export function input(option: InputButtonOption, handler: (value: string) => void): InputEvent {
    return new InputEvent(option, handler);
}

export type InputButtonOption = {
    input: UIInputOption,
    button: UIButtonOption,
};

class InputEvent extends Event {
    private id: number = -1;
    private idBtn: number = -1;

    private option: InputButtonOption;
    private handler: ((value: string) => void) | null;
    private clicked: boolean = false;

    constructor(option: InputButtonOption, handler: (value: string) => void) {
        super();
        this.option = option;
        this.handler = handler;
    }

    public onStart(screen: Screen, scene: Scene, now: number): void {
        const input = new UIInput(screen, this.option.input);
        this.id = createWindow(input);
        const btn = new UIButton(screen, this.option.button);
        btn.addClickEvent(() => {
            this.handler?.(input.getText());
            AUDIO.se.ok.play();
            this.clicked = true;
        });
        this.idBtn = createWindow(btn);
        setActiveWindow(this.id);
    }

    public onEnd(): void {
        deleteWindow(this.id);
        deleteWindow(this.idBtn);
        this.id = -1;
        this.idBtn = -1;
    }

    public continueUpdate(screen: Screen): boolean {
        return !this.clicked;
    }
}

export function createJob(jobFunc: (screen: Screen) => Job): JobCreateEvent {
    return new JobCreateEvent(jobFunc);
}

class JobCreateEvent extends Event {
    private jobFunc: (screen: Screen) => Job;

    constructor(jobFunc: (screen: Screen) => Job) {
        super();
        this.jobFunc = jobFunc;
    }

    public onStart(screen: Screen, scene: Scene, now: number): void {
        scene.addJob(this.jobFunc(screen));
    }

    public onEnd(): void {
    }

    public continueUpdate(screen: Screen): boolean {
        return false;
    }
}

export class Job {
    public update() { }
    public render(screen: Screen) { }
    public hasDone(): boolean {
        return true;
    }
}

export function job(checkDone: () => boolean, renderAction: ((screen: Screen) => void) | null, updateAction: (() => void) | null = null): Job {
    return new (class extends Job {
        public update(): void {
            updateAction?.();
        }
        public render(screen: Screen): void {
            renderAction?.(screen);
        }
        public hasDone(): boolean {
            return checkDone();
        }
    })();
}

export class Scene {
    private events: Event[] = [];
    private jobs: Job[] = [];

    private index: number = 0;

    public constructor(events: Event[]) {
        this.events = events;
    }

    public add(event: Event): this {
        this.events.push(event);
        return this;
    }

    public addCustomJob(checkDone: () => boolean, renderAction: ((screen: Screen) => void) | null, updateAction: (() => void) | null = null): this {
        return this.addJob(new (class extends Job {
            public update(): void {
                updateAction?.();
            }
            public render(screen: Screen): void {
                renderAction?.(screen);
            }
            public hasDone(): boolean {
                return checkDone();
            }
        })());
    }

    public addJob(job: Job): this {
        this.jobs.push(job);
        return this;
    }

    public update(screen: Screen, now: number): void {
        if (this.index >= this.events.length) {
            return;
        }

        while (this.index < this.events.length) {
            const evt = this.events[this.index];
            if (!evt.isInitialized()) {
                evt.onStart(screen, this, now);
            }
            if (!evt.continueUpdate(screen)) {
                evt.onEnd();
                this.index++;
                continue;
            }
            evt.onUpdate(screen, now);
            break;
        }
        
        for (const job of this.jobs) {
            job.update();
            if (job.hasDone()) {
                this.jobs.splice(this.jobs.indexOf(job), 1);
            }
        }
    }

    public render(screen: Screen): void {
        if (this.index < this.events.length) {
            this.events[this.index].render(screen);
        }
        for (const job of this.jobs) {
            job.render(screen);
        }
    }

    public click(screen: Screen): void {
        if (this.index < this.events.length) {
            this.events[this.index].onClick(screen);
        }
    }
}

let currentScene: Scene | null = null;

export function createScene(events: Event[]): Scene {
    return new Scene(events);
}

export function setScene(scene: Scene): void {
    currentScene = scene;
}

export function updateScene(screen: Screen, now: number): void {
    currentScene?.update(screen, now);
}

export function renderScene(screen: Screen): void {
    currentScene?.render(screen);
}

export function clickScene(screen: Screen): void {
    currentScene?.click(screen);
}
