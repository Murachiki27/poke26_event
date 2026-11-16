import { drawSpriteUI, drawSpriteUIRepeat, drawTextUI, drawWaitIconUI, drawWindowUI, ICON_UVS } from "../graphics/ui";
import { pixelToTile, tileToPixel, type Screen } from "../graphics/screen.ts";

import { Howl } from 'howler';
import { SCREEN_TILE_HEIGHT, SCREEN_TILE_WIDTH } from "./device.ts";
import { UIBase, type UIBaseOption } from "./uibase.ts";
import { addInputBox } from "./htmlelement.ts";
import { AUDIO } from "../audio/audio.ts";

export type MessageEndAction = () => void;
export type UIMessageOption = UIBaseOption & {
    tx?: number;
    ty?: number;
    tileWidth?: number;
    tileHeight?: number;
};

class MessageSystem {
    private readonly CHAR_MS = 6;
    private readonly LINE_MS = 6;
    private readonly MSG_SPEED_NORMAL = 1;
    private readonly MSG_SPEED_FAST = 4;
    private readonly BLINK_CYCLE = 100;

    private option: UIMessageOption;

    private ticks: number = 0;
    private maxIndex: number = 0;
    private msgSpeed: number = this.MSG_SPEED_NORMAL;
    private blinkCounter: number = 0;
    private chIndex: number = 0;
    private lineIndex: number = 0;
    private aniIndex: number = 0;
    private lineTimer: number = 0;
    private lines: string[] = [];
    private visible: boolean = false;

    private endAction: MessageEndAction | null = null;
    private ended: boolean = false;

    private se: Howl;

    constructor(option: UIMessageOption) {
        this.option = option;
        this.se = AUDIO.se.ok;
    }

    setOption(option: UIMessageOption): void {
        this.option = {
            ...this.option,
            ...option
        };
    }

    setMsg(lines: string[]): void {
        this.lines = lines;
        this.maxIndex = Math.min(lines.length - 1, 1);
    }

    setVisible(visible: boolean): void {
        this.visible = visible;
    }

    resetState(): void {
        this.lines = [];
        this.ticks = 0;
        this.maxIndex = 0;
        this.msgSpeed = this.MSG_SPEED_NORMAL;
        this.blinkCounter = 0;
        this.chIndex = 0;
        this.lineIndex = 0;
        this.aniIndex = 0;
        this.lineTimer = 0;
        this.ended = false;
    }

    setEndAction(endAction: MessageEndAction | null): void {
        this.endAction = endAction;
    }

    update(): void {
        if (!this.visible || this.ended) {
            return;
        }
        if (this.lineTimer > 0) {
            this.lineTimer--;
            if (this.lineTimer === 0) {
                this.chIndex = 0;
                this.lineIndex++;
                this.blinkCounter = 0;
            }
        }

        if (this.lineIndex + this.aniIndex < this.lines.length) {
            if (this.chIndex >= this.lines[this.lineIndex + this.aniIndex].length) {
                if (this.aniIndex < this.maxIndex) {
                    this.aniIndex++;
                    this.chIndex = 0;
                    return;
                }
                this.blinkCounter++;
                if (this.blinkCounter >= this.BLINK_CYCLE) {
                    this.blinkCounter = 0;
                }
            } else {
                this.ticks += this.msgSpeed;
                if (this.ticks >= this.CHAR_MS) {
                    this.ticks = 0;
                    this.chIndex++;
                }
            }
        }
    }

    render(screen: Screen): void {
        if (!this.visible) {
            return;
        }
        if (this.lines.length > 0) {
            const s = this.aniIndex === 0 ? this.lines[this.lineIndex].slice(0, this.chIndex) : this.lines[this.lineIndex];
            drawTextUI(screen, s, this.option.tx + 1, this.option.ty + 2 - (this.lineTimer > 0 ? 1 : 0));
        }
        if (this.lineIndex + 1 < this.lines.length) {
            if (this.aniIndex > 0) {
                drawTextUI(screen, this.lines[this.lineIndex + 1].slice(0, this.chIndex), this.option.tx + 1, this.option.ty + 4 - (this.lineTimer > 0 ? 1 : 0));
            }
        }
        if (
            this.aniIndex === this.maxIndex
            && this.chIndex >= this.lines[this.lineIndex + this.aniIndex].length
            && this.blinkCounter < (this.BLINK_CYCLE / 2)
        ) {
            drawWaitIconUI(screen, this.option.tx + this.option.tileWidth - 2, this.option.ty + this.option.tileHeight - 2);
        }
        drawWindowUI(screen, this.option.tx, this.option.ty, this.option.tileWidth, this.option.tileHeight);
    }

    isEnded(): boolean {
        return this.ended;
    }

    onPointerDown(): void {
        if (this.visible) {
            if (this.aniIndex < this.maxIndex || this.chIndex < this.lines[this.lineIndex + this.aniIndex].length) {
                this.msgSpeed = this.MSG_SPEED_FAST;
            } else if (!this.ended) {
                this.se.play();
                this.msgSpeed = this.MSG_SPEED_NORMAL;
                if (this.lineIndex + 2 < this.lines.length) {
                    this.lineTimer = this.LINE_MS;
                } else {
                    this.ended = true;
                    this.endAction?.();
                }
            }
        }
    }
}


const msgSystem = new MessageSystem({ tx: 0, ty: SCREEN_TILE_HEIGHT - 6, tileWidth: SCREEN_TILE_WIDTH, tileHeight: 6 });
const windowMap: Map<number, UIBase> = new Map();
let nextId = 0;
let activeWindow: UIBase | null = null;

export function createWindow(window: UIBase): number {
    const id = nextId++;
    windowMap.set(id, window);
    return id;
}

export function deleteWindow(id: number): void {
    const win = windowMap.get(id);
    if (win !== undefined) {
        if (activeWindow === win) {
            activeWindow = null;
        }
        win.onClose();
        windowMap.delete(id);
    }
}

export function setMsgBoxLines(...lines: string[]): void {
    msgSystem.setMsg(lines);
}

export function setMsgBoxVisible(visible: boolean): void {
    msgSystem.setVisible(visible);
}

export function resetMsgBoxState(): void {
    msgSystem.resetState();
}

export function setMsgBoxEndAction(endAction: MessageEndAction): void {
    msgSystem.setEndAction(endAction);
}

export function updateMsgBox(): void {
    msgSystem.update();
}

export function renderMsgBox(screen: Screen): void {
    msgSystem.render(screen);
}

function uiSort(a: UIBase, b: UIBase): number {
    return a.zIndex - b.zIndex;
}

export function updateUI(): void {
    Array.from(windowMap.values())
        .sort(uiSort)
        .forEach(w => w.update());
}

export function renderUI(screen: Screen): void {
    Array.from(windowMap.values())
        .sort(uiSort)
        .forEach(w => w.render(screen));
}

export function onMsgBoxStepAction(x: number, y: number): void {
    activeWindow?.pointerDown(x, y);
    msgSystem.onPointerDown();
}

export function setActiveWindow(id: number): void {
    const win = windowMap.get(id);
    if (win !== undefined) {
        activeWindow = win;
    }
}

export function isMsgBoxEnded(): boolean {
    return msgSystem.isEnded();
}

export function setMsgOption(option: UIMessageOption): void {
    msgSystem.setOption(option);
}
