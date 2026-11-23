import { Screen, tileToPixel } from "../graphics/screen";
import { drawSpriteUI, drawSpriteUIRepeat, drawTextUI, drawWindowUI, ICON_UVS } from "../graphics/ui";
import { addButtonElement, addInputBox } from "./htmlelement";

export type UIBaseOption = {
    tx: number,
    ty: number,
    tileWidth: number,
    tileHeight: number,
};

export abstract class UIBase {
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

    constructor(option: UIBaseOption) {
        this.tx = option.tx;
        this.ty = option.ty;
        this.tileWidth = option.tileWidth;
        this.tileHeight = option.tileHeight;
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

    onClose(): void {
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

export type UIButtonOption = UIBaseOption & {
    label: { value: string, tx: number, ty: number },
};

export class UIButton extends UIBase {
    private buttonEl: HTMLButtonElement;
    private labelX: number;
    private labelY: number;

    constructor(scrren: Screen, option: UIButtonOption) {
        super(option);
        this.buttonEl = addButtonElement(scrren, option.label.value, option.tx, option.ty, option.tileWidth, option.tileHeight);
        this.labelX = option.label.tx;
        this.labelY = option.label.ty;
    }

    addClickEvent(handler: (this: HTMLButtonElement, ev: PointerEvent) => any): void {
        this.buttonEl.addEventListener('pointerdown', handler);
    }

    protected renderScreen(screen: Screen): void {
        drawWindowUI(screen, this.tx, this.ty, this.tileWidth, this.tileHeight);
        // drawSpriteUIRepeat(screen, this.tx, this.ty, this.tileWidth, this.tileHeight, 2, 18);
        drawTextUI(screen, this.buttonEl.textContent, this.labelX, this.labelY);
    }

    setVisible(visible: boolean): void {
        super.setVisible(visible);
        this.buttonEl.hidden = !visible;
    }

    onClose(): void {
        this.buttonEl.remove();
    }
}

export type UIInputOption = UIBaseOption & {
    name: string,
    maxLength?: number,
};

export class UIInput extends UIBase {
    private inputEl: HTMLInputElement;
    private title: string;
    private isFocused: boolean = false;
    private isComposing: boolean = false;
    private compStart: number = 0;
    private compLength: number = 0;
    private ticks: number = 0;

    constructor(scrren: Screen, option: UIInputOption) {
        super(option);
        this.inputEl = addInputBox(scrren, option.name, option.tx + 1, option.ty + 1, option.tileWidth - 2, option.tileHeight - 2);
        this.title = option.name;
        if (option.maxLength) {
            this.inputEl.maxLength = option.maxLength;
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

    public setText(value: string): void {
        this.inputEl.value = value;
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
        drawTextUI(screen, this.title, this.tx + 2, this.ty);

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

    setVisible(visible: boolean): void {
        super.setVisible(visible);
        this.inputEl.hidden = !visible;
    }

    onClose(): void {
        this.inputEl.remove();
    }
}

export type UISelectorOption = UIBaseOption & {
    items: string[],
};

export class UISelector extends UIBase {
    private items: string[];
    private index: number = -1;
    private selected: boolean = false;

    private handler: ((index: number) => void) | null = null;

    constructor(option: UISelectorOption) {
        super(option);
        this.items = option.items;
    }

    setClickEvent(handler: (index: number) => void): void {
        this.handler = handler;
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

                    this.handler?.(this.index);
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

    setItems(items: string[]): void {
        this.items = items;
    }
}

