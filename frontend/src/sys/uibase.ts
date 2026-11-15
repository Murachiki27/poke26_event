import { Screen, tileToPixel } from "../graphics/screen";
import { drawSpriteUI, drawSpriteUIRepeat, drawTextUI, drawWindowUI } from "../graphics/ui";
import { addButtonElement } from "./htmlelement";

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

export class UIButton extends UIBase {
    private buttonEl: HTMLButtonElement;

    constructor(scrren: Screen, label: string, tx: number, ty: number, tileWidth: number, tileHeight: number) {
        super(tx, ty, tileWidth, tileHeight);
        this.buttonEl = addButtonElement(scrren, label, tx, ty, tileWidth, tileHeight);
    }

    addClickEvent(handler: (this: HTMLButtonElement, ev: PointerEvent) => any): void {
        this.buttonEl.addEventListener('pointerdown', handler);
    }

    protected renderScreen(screen: Screen): void {
        // drawWindowUI(screen, this.tx, this.ty, this.tileWidth, this.tileHeight);
        drawSpriteUIRepeat(screen, this.tx, this.ty, this.tileWidth, this.tileHeight, 2, 18);
        // drawTextUI(screen, text, this.tx + 1, this.ty + 2);
    }

    onClose(): void {
        this.buttonEl.remove();
    }
}



