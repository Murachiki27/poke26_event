import  {type Screen} from "../graphics/screen.ts";
import { createWindow, deleteWindow, isMsgBoxEnded, resetMsgBoxState, SelectorWindow, setActiveWindow, setMsgBoxLines, setMsgBoxVisible } from "../sys/msgbox.ts";

import { getSpriteSheet } from '../data/sheet.ts';
import type { DefferedConst } from "../util/ref.ts";

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

class MessageEvent extends Event {
    private readonly lines: string[];
    private readonly afterShowing: boolean;

    constructor(lines: string[], afterShowing: boolean) {
        super();
        this.lines = lines;
        this.afterShowing = afterShowing;
    }

    onStart(screen: Screen, scene: Scene, now: number) {
        resetMsgBoxState();
        setMsgBoxLines(...this.lines);
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

export type UpdateAction = (ticks: number) => void;
export type StartAction = () => void;
export type EndAction = () => void;

class TimeEvent extends Event {
    private readonly tickLength: number;
    private readonly updatepAction: UpdateAction | null;
    private readonly startAction: StartAction | null;
    private readonly endAction: EndAction | null;
    private ticks: number = 0;

    constructor(tickLength: number, updatepAction: UpdateAction | null = null, startAction: StartAction | null = null, endAction: EndAction | null = null) {
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

export type SelectAction = (index: number) => void;

class SelectorEvent extends Event {
    private window: SelectorWindow;
    private selectAction: SelectAction;
    private id: number = -1;

    constructor(items: string[], tx: number, ty: number, tileWidth: number, tileHeight: number, selectAction: SelectAction) {
        super();
        this.window = new SelectorWindow(items, tx, ty, tileWidth, tileHeight);
        this.selectAction = selectAction;
    }

    public onStart(screen: Screen, scene: Scene, now: number): void {
        this.id = createWindow(this.window);
        setActiveWindow(this.id);
    }

    public onEnd(): void {
        this.selectAction(this.window.getSelectIndex());
        deleteWindow(this.id);
        this.id = -1;
    }

    public continueUpdate(screen: Screen): boolean {
        return !this.window.isSelected();
    }
}

export class Job {
    public update() { }
    public render(screen: Screen) { }
    public hasDone(): boolean {
        return true;
    }
}

export class Scene {
    private events: Event[] = [];
    private jobs: Job[] = [];

    private index: number = 0;

    public constructor() {}

    public addMessage(lines: string[], afterShowing: boolean = false): this {
        this.events.push(new MessageEvent(lines, afterShowing));
        return this;
    }

    public addSelector(items: string[], tx: number, ty: number, tileWidth: number, tileHeight: number, selectAction: SelectAction): this {
        this.events.push(new SelectorEvent(items, tx, ty, tileWidth, tileHeight, selectAction));
        return this;
    }

    public addTime(tickLength: number, updatepAction: UpdateAction, startAction: StartAction | null = null, endAction: EndAction | null = null): this {
        this.events.push(new TimeEvent(tickLength, updatepAction, startAction, endAction));
        return this;
    }

    public addWait(check: (screen: Screen) => boolean): this {
        this.events.push(new (class extends Event {
            public continueUpdate(screen: Screen): boolean {
                return check(screen);
            }
        })());
        return this;
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
