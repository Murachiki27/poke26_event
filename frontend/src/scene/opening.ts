import  {type Screen} from "../graphics/screen.ts";
import { getSpriteSheet } from "../data/sheet";
import { effectContrast, effectLight } from "../graphics/effector";
import { setMsgBoxVisible, setMsgOption } from "../sys/msgbox";
import { createJob, createScene, input, job, Job, message, messageFunc, Scene, timer } from "./scene";
import type { DefferedConst } from "../util/ref.ts";
import { SCREEN_TILE_HEIGHT, SCREEN_TILE_WIDTH } from "../sys/device.ts";


const sheetOp = getSpriteSheet('OP');


const WAIT_TICKS = 30;
let sheetOpVisible: boolean = false;
let sheetX = 6;
let sheetU = 0, sheetV = 0;

setMsgOption({ tx: 0, ty: 18, tileWidth: SCREEN_TILE_WIDTH, tileHeight: 6 });

let userName = '';

export const scene = createScene([
    createJob(() => job(
        () => sheetOpVisible,
        (screen) => screen.blitCell(sheetOp.value, sheetX, 4, 7, 7, sheetU, sheetV)
    )),
    timer(30, (ticks) => {
        const step = ticks / 5;
        if (ticks % 5 === 0) {
            switch (step) {
                case 1: effectLight(2); break;
                case 2: effectLight(1); break;
                case 3: effectLight(0); break;
                case 4: effectContrast(2); break;
                case 5: effectContrast(1); break;
                case 6: effectContrast(0); break;
            }
        }
    }, () => {
        effectLight(3);
        effectContrast(3);
    }),
    message(["はじめまして！", "ポケット　モンスターの　せかいへ", "ようこそ！"]),
    message(["わたしの　なまえは　オーキド", "みんなからは　ポケモン　はかせと", "したわれて　おるよ"], true),
    timer(15, (ticks) => {
        const step = ticks / 5;
        if (ticks % 5 === 0) {
            switch (step) {
                case 1: effectLight(1); break;
                case 2: effectLight(2); break;
                case 3: effectLight(3); break;
            }
        }
    }, null, () => {
        setMsgBoxVisible(false);
        effectLight(0);
        sheetX = 20;
        sheetU = 7;
        sheetV = 7;
    }),
    timer(WAIT_TICKS, (ticks) => {
        if (ticks > WAIT_TICKS - 7) {
            sheetX -= 2;
        }
    }),
    message(["この　せかいには", "ポケット　モンスターと　よばれる"]),
    message(["いきもの　たちが", "いたるところに　すんでいる！"]),
    message(["その　ポケモン　という　いきものを", "ひとは　ペットに　したり", "しょうぶに　つかったり・・・"]),
    message(["そして・・・"]),
    message(["わたしは　この　ポケモンの", "けんきゅうを　してる　というわけだ"], true),
    timer(15, (ticks) => {
        const step = ticks / 5;
        if (ticks % 5 === 0) {
            switch (step) {
                case 1: effectLight(1); break;
                case 2: effectLight(2); break;
                case 3: effectLight(3); break;
            }
        }
    }, null, () => {
        setMsgBoxVisible(false);
        effectLight(0);
        sheetX = 20;
        sheetU = 0;
        sheetV = 7;
    }),
    timer(WAIT_TICKS, (ticks) => {
        if (ticks > WAIT_TICKS - 7) {
            sheetX -= 2;
        }
    }),
    message(["では　はじめに　きみの　なまえを", "おしえて　もらおう！"]),
    input({
        input: { name: ' なまえ ', tx: 1, ty: 12, tileWidth: 18, tileHeight: 5, maxLength: 8 },
        button: { label: { value: 'けってい', tx: 8, ty: 19 }, tx: 7, ty: 18, tileWidth: 6, tileHeight: 3 },
    }, (value) => {
        userName = value;
    }),
    messageFunc((screen) => ["ふむ・・・", `${userName}　と　いうんだな！`], true),
    timer(15, (ticks) => {
        const step = ticks / 5;
        if (ticks % 5 === 0) {
            switch (step) {
                case 1: effectLight(1); break;
                case 2: effectLight(2); break;
                case 3: effectLight(3); break;
            }
        }
    }, null, () => {
        setMsgBoxVisible(false);
        effectLight(0);
        sheetU = 0;
        sheetV = 14;
    }),
    timer(30, (ticks) => {
        const step = ticks / 5;
        if (ticks % 5 === 0) {
            switch (step) {
                case 1: effectLight(2); break;
                case 2: effectLight(1); break;
                case 3: effectLight(0); break;
                case 4: effectContrast(2); break;
                case 5: effectContrast(1); break;
                case 6: effectContrast(0); break;
            }
        }
    }, () => {
        effectLight(3);
        effectContrast(3);
    }),
    message(["こいつは　わたしの　まご", "きみの　おさななじみであり", "ライバル　である"]),
    message(["・・・えーと？", "なまえは　なんて　いったかな？"]),
    message(["そうだ　そうだ！　おもいだしたぞ", "グリーン　という　なまえだ"]),
    timer(15, (ticks) => {
        const step = ticks / 5;
        if (ticks % 5 === 0) {
            switch (step) {
                case 1: effectLight(1); break;
                case 2: effectLight(2); break;
                case 3: effectLight(3); break;
            }
        }
    }, null, () => {
        setMsgBoxVisible(false);
        sheetU = 0;
        sheetV = 7;
    }),
    timer(15, (ticks) => {
        const step = ticks / 5;
        if (ticks % 5 === 0) {
            switch (step) {
                case 1: effectLight(2); break;
                case 2: effectLight(1); break;
                case 3: effectLight(0); break;
            }
        }
    }),
    message(["レッド！"]),
    message(["いよいよ　これから", "きみの　ものがたりの　はじまりだ！"]),
    message(["ゆめと　ぼうけんと！", "ポケット　モンスターの　せかいへ！", "レッツゴー！"]),
]);

