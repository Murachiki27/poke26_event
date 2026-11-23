import type { Screen } from "../graphics/screen";
import { drawSpriteUI, drawSpriteUIRepeat, drawTextUI, drawWindowUI, ICON_UVS } from "../graphics/ui";
import { createWindow, deleteWindow, setActiveWindow } from "../sys/msgbox";
import { UIButton } from "../sys/uibase";
import { createEventScene, Event, input, message, messageFunc, EventScene, setScene, registerScene } from "./scene";

export const ID = "input";


let msg: string = '';

registerScene(ID, (screen) => createEventScene([
    input({
        input: { name: ' なまえ ', tx: 1, ty: 4, tileWidth: 14, tileHeight: 5, maxLength: 8 },
        button: { label: { value: 'けってい', tx: 6, ty: 11 }, tx: 5, ty: 10, tileWidth: 6, tileHeight: 3 },
    }, (value: string) => {
            msg = value;
    }),
    messageFunc(() => ['きみは ' + msg + ' ていうんだね'])
]));
