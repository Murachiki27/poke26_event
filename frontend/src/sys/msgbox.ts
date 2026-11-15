import { drawSpriteUI, drawSpriteUIRepeat, drawTextUI, drawWaitIconUI, drawWindowUI, ICON_UVS } from "../graphics/ui";
import { pixelToTile, tileToPixel, type Screen } from "../graphics/screen.ts";

import { Howl } from 'howler';
import { SCREEN_TILE_HEIGHT, SCREEN_TILE_WIDTH } from "./device.ts";
import { UIBase } from "./uibase.ts";
import { addInputBox } from "./htmlelement.ts";

export type MessageEndAction = () => void;

class MessageSystem {
    private readonly CHAR_MS = 6;
    private readonly LINE_MS = 6;
    private readonly MSG_SPEED_NORMAL = 1;
    private readonly MSG_SPEED_FAST = 4;
    private readonly BLINK_CYCLE = 100;

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

    constructor() {
        this.se = new Howl({
            src: [`${import.meta.env.BASE_URL}assets/audio/sfx/next.ogg`],
            volume: 0.1,
        });
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
            drawTextUI(screen, s, 1, SCREEN_TILE_HEIGHT - 4 - (this.lineTimer > 0 ? 1 : 0));
        }
        if (this.lineIndex + 1 < this.lines.length) {
            if (this.aniIndex > 0) {
                drawTextUI(screen, this.lines[this.lineIndex + 1].slice(0, this.chIndex), 1, SCREEN_TILE_HEIGHT - 2 - (this.lineTimer > 0 ? 1 : 0));
            }
        }
        if (
            this.aniIndex === this.maxIndex
            && this.chIndex >= this.lines[this.lineIndex + this.aniIndex].length
            && this.blinkCounter < (this.BLINK_CYCLE / 2)
        ) {
            drawWaitIconUI(screen, SCREEN_TILE_WIDTH - 2, SCREEN_TILE_HEIGHT - 2);
        }
        drawWindowUI(screen, 0, SCREEN_TILE_HEIGHT - 6, SCREEN_TILE_WIDTH, 6);
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

export class SelectorWindow extends UIBase {
    private items: string[];
    private index: number = -1;
    private selected: boolean = false;

    constructor(items: string[], tx: number, ty: number, tileWidth: number, tileHeight: number) {
        super(tx, ty, tileWidth, tileHeight);
        this.items = items;
    }

    protected renderScreen(screen: Screen): void {
        for (let i = 0; i < this.items.length; ++i) {
            if (i === this.index) {
                const off = this.selected ? ICON_UVS.cursorSelected : ICON_UVS.cursor;
                drawSpriteUI(screen, this.tx + 1, this.ty + i * 2 + 2, off.u, off.v);
            }
            drawTextUI(screen, this.items[i], this.tx + 2, this.ty + i * 2 + 2);
        }
        drawWindowUI(screen, this.tx, this.ty, this.tileWidth, this.tileHeight);
    }

    protected pointerDownScreen(x: number, y: number): void {
        if (this.isHover(x, y)) {
            const y1 = y - this.pixelY - 12;
            const h = tileToPixel(this.items.length) * 2;
            if (y1 >= 0 && y1 < h) {
                const i = Math.trunc(y1 / 16);
                if (i !== this.index) {
                    this.index = i;
                } else {
                    this.selected = true;
                }
            }
        }
    }

    isSelected(): boolean {
        return this.selected;
    }

    getSelectIndex(): number {
        return this.index;
    }
}

export class InputWindow extends UIBase {
    private inputEl: HTMLInputElement;

    private isFocused: boolean = false;
    private isComposing: boolean = false;
    private compStart: number = 0;
    private compLength: number = 0;
    private ticks: number = 0;

    constructor(scrren: Screen, name: string, tx: number, ty: number, tileWidth: number, tileHeight: number, maxLength: number | null = null) {
        super(tx, ty, tileWidth, tileHeight);
        this.inputEl = addInputBox(scrren, name, tx + 1, ty + 1, tileWidth - 2, tileHeight - 2);
        if (maxLength) {
            this.inputEl.maxLength = maxLength;
        }
        this.inputEl.addEventListener('compositionstart', () => {
            this.isComposing = true;
            this.compStart = this.inputEl.selectionStart ?? this.inputEl.value.length;
            this.compLength = 0;
        });
        this.inputEl.addEventListener('compositionupdate', (e: CompositionEvent) => {
            this.compLength = e.data.length;
        });
        this.inputEl.addEventListener('compositionend', () => {
            this.isComposing = false;
            this.compStart = 0;
            this.compLength = 0;
        });
        this.inputEl.addEventListener('focus', () => {
            this.isFocused = true;
            this.ticks = 0;
        });
        this.inputEl.addEventListener('blur', () => {
            this.isFocused = false;
        });
    }

    public getText(): string {
        return this.inputEl.value;
    }

    protected updateScreen(): void {
        if (this.isFocused) {
            this.ticks++;
            if (this.ticks >= 60) {
                this.ticks = 0;
            }
        }
    }

    protected renderScreen(screen: Screen): void {
        drawWindowUI(screen, this.tx, this.ty, this.tileWidth, this.tileHeight);
        drawTextUI(screen, ' にゅうりょく ', this.tx + 2, this.ty);

        const text = this.inputEl.value;
        drawTextUI(screen, text, this.tx + 1, this.ty + 2);
        if (this.isFocused && this.ticks < 30) {
            const cursorIndex = this.inputEl.selectionStart ?? text.length;
            drawSpriteUI(screen, this.tx + 1 + cursorIndex, this.ty + 2, ICON_UVS.charCursor.u, ICON_UVS.charCursor.v);
        }
        if (this.isComposing) {
            drawSpriteUIRepeat(screen, this.tx + 1 + this.compStart, this.ty + 3, this.compLength, 1, ICON_UVS.compLine.u, ICON_UVS.compLine.v);
        }
    }

    onClose(): void {
        this.inputEl.remove();
    }
}


const msgSystem = new MessageSystem();
const windowStack: UIBase[] = [];
let activeWindow: UIBase | null = null;

export function createWindow(window: UIBase): number {
    const c = windowStack.push(window);
    return c - 1;
}

export function deleteWindow(id: number): void {
    if (windowStack[id] !== undefined) {
        if (activeWindow === windowStack[id]) {
            activeWindow.onClose();
            activeWindow = null;
        }
        windowStack.splice(id, 1);
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

export function updateUI(): void {
    for (const w of windowStack.toSorted((a, b) => a.zIndex - b.zIndex)) {
        w.update();
    }
}

export function renderUI(screen: Screen): void {
    for (const w of windowStack.toSorted((a, b) => a.zIndex - b.zIndex)) {
        w.render(screen);
    }
}

export function onMsgBoxStepAction(x: number, y: number): void {
    activeWindow?.pointerDown(x, y);
    msgSystem.onPointerDown();
}

export function setActiveWindow(id: number): void {
    if (windowStack[id] !== undefined) {
        activeWindow = windowStack[id];
    }
}

export function isMsgBoxEnded(): boolean {
    return msgSystem.isEnded();
}
