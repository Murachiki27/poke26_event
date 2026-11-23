import { SCREEN_TILE_HEIGHT, SCREEN_TILE_WIDTH } from "../sys/device";
import { createEventScene, EventScene, registerScene, selector, setScene } from "./scene";
import { ID as OPENING_ID } from './opening.ts';
import { ID as BATTLE_ID } from './battle.ts';
import { ID as INPUT_ID } from './input.ts';

export const ID = "debug";

const w = SCREEN_TILE_WIDTH - 4;
const h = SCREEN_TILE_HEIGHT - 6;
const x = Math.trunc(SCREEN_TILE_WIDTH / 2 - w / 2);
const y = Math.trunc(SCREEN_TILE_HEIGHT / 2 - h / 2);


function sceneSelect(index: number): void {
    switch (index) {
        case 0:
            setScene(OPENING_ID);
            break;
        case 1:
            setScene(BATTLE_ID);
            break;
        case 2:
            setScene(INPUT_ID);
            break;
    }
}

registerScene(ID, (screen) => createEventScene([
    selector({ items: ["オープニングテスト", "バトルテスト", "にゅうりょく"], tx: x, ty: y, tileWidth: w, tileHeight: h }, sceneSelect),
]));
