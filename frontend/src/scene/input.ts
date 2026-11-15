import type { Screen } from "../graphics/screen";
import { drawSpriteUI, drawSpriteUIRepeat, drawTextUI, drawWindowUI, ICON_UVS } from "../graphics/ui";
import { createWindow, deleteWindow, InputWindow, SelectorWindow, setActiveWindow } from "../sys/msgbox";
import { UIButton } from "../sys/uibase";
import { Event, Scene, setScene } from "./scene";

class InputEvent extends Event {
    private window: InputWindow | null = null;
    private id: number = -1;
    private idBtn: number = -1;

    private name: string;
    private tx: number;
    private ty: number;
    private tw: number;
    private th: number;
    private maxLength: number | null;
    private handler: ((value: string) => void) | null;
    private clicked: boolean = false;

    constructor(name: string, tx: number, ty: number, tw: number, th: number, maxLength: number | null = null, handler: (value: string) => void) {
        super();
        this.name = name;
        this.tx = tx;
        this.ty = ty;
        this.tw = tw;
        this.th = th;
        this.maxLength = maxLength;
        this.handler = handler;
    }

    public onStart(screen: Screen, scene: Scene, now: number): void {
        const input = new InputWindow(screen, this.name, this.tx, this.ty, this.tw, this.th, this.maxLength);
        this.id = createWindow(input);
        const btn = new UIButton(screen, 'けってい', this.tx + 2, this.ty + 7, 8, 4);
        btn.addClickEvent(() => {
            this.handler?.(input.getText());
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

export function makeScene(screen: Screen): Scene {
    let msg: string = '';
    const scene: Scene = new Scene();

    scene
        .add(new InputEvent('name', 1, 4, 14, 5, 8, (value: string) => {
            msg = value;
        }))
        .addMessage(['きみは ' + msg + ' ていうんだね'])
    
    ;

    return scene;
}
