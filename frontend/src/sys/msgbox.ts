import { drawSpriteUI, drawTextUI, drawWaitIconUI, drawWindowUI } from "../graphics/ui";
import { pixelToTile, tileToPixel, type Screen } from "../graphics/screen.ts";

import { Howl } from 'howler';
import { SCREEN_TILE_HEIGHT, SCREEN_TILE_WIDTH } from "./device.ts";

export type MessageEndAction = () => void;

abstract class UIBase {
    protected tx: number;
    protected ty: number;
    protected tileWidth: number;
    protected tileHeight: number;
    protected visible: boolean;
    public zIndex: number;

    public get pixelX(): number {
        return tileToPixel(this.tx);
    }
    
    public get pixelY(): number {
        return tileToPixel(this.ty);
    }

    public get pixelWidth(): number {
        return tileToPixel(this.tileWidth);
    }
    
    public get pixelHeight(): number {
        return tileToPixel(this.tileHeight);
    }

    constructor(tx: number, ty: number, tileWidth: number, tileHeight: number) {
        this.tx = tx;
        this.ty = ty;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.zIndex = 0;
        this.visible = true;
    }

    update(): void {
        if (this.visible) {
            this.updateScreen();
        }
    }

    protected updateScreen(): void {
    }

    render(screen: Screen): void {
        if (this.visible) {
            this.renderScreen(screen);
        }
    }

    protected renderScreen(screen: Screen): void {
    }

    pointerDown(x: number, y: number): void {
        if (this.visible) {
            this.pointerDownScreen(x, y);
        }
    }

    protected pointerDownScreen(x: number, y: number): void {
    }

    isHover(x: number, y: number): boolean {
        return x >= this.pixelX && y >= this.pixelY && x < (this.pixelX + this.pixelWidth) && y < (this.pixelY + this.pixelHeight);
    }

    setVisible(visible: boolean): void {
        this.visible = visible;
    }

    isVisible(): boolean {
        return this.visible;
    }

    show(): void {
        this.setVisible(true);
    }

    hide(): void {
        this.setVisible(false);
    }
}

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
                const u = this.selected ? 22 : 23;
                drawSpriteUI(screen, this.tx + 1, this.ty + i * 2 + 2, u, 4);
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
