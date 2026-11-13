import  {type Screen} from "../graphics/screen.ts";
import { getSpriteSheet } from "../data/sheet";
import { effectContrast, effectLight } from "../graphics/effector";
import { setMsgBoxVisible } from "../sys/msgbox";
import { Job, Scene } from "./scene";
import type { DefferedConst } from "../util/ref.ts";


const sheetOp = getSpriteSheet('OP');

let sheetOpVisible: boolean = false;
let sheetX = 6;
let sheetU = 0, sheetV = 0;


let scene: Scene = new Scene();

scene
    .addCustomJob(
        () => sheetOpVisible,
        (screen) => screen.blitCell(sheetOp.value, sheetX, 4, 7, 7, sheetU, sheetV)
    )
    .addTime(30, (ticks) => {
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
    })
    .addMessage(["はじめまして！", "ポケット　モンスターの　せかいへ", "ようこそ！"])
    .addMessage(["わたしの　なまえは　オーキド", "みんなからは　ポケモン　はかせと", "したわれて　おるよ"], true)
    .addTime(15, (ticks) => {
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
    })
    .addTime(20, (ticks) => {
        if (ticks > 13) {
            sheetX -= 2;
        }
    })
    .addMessage(["この　せかいには", "ポケット　モンスターと　よばれる"])
    .addMessage(["いきもの　たちが", "いたるところに　すんでいる！"])
    .addMessage(["その　ポケモン　という　いきものを", "ひとは　ペットに　したり", "しょうぶに　つかったり・・・"])
    .addMessage(["そして・・・"])
    .addMessage(["わたしは　この　ポケモンの", "けんきゅうを　してる　というわけだ"], true)
    .addTime(15, (ticks) => {
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
    })
    .addTime(20, (ticks) => {
        if (ticks > 13) {
            sheetX -= 2;
        }
    })
    .addMessage(["では　はじめに　きみの　なまえを", "おしえて　もらおう！"])
    .addMessage(["ふむ・・・", "レッド　と　いうんだな！"], true)
    .addTime(15, (ticks) => {
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
    })
    .addTime(30, (ticks) => {
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
    })
    .addMessage(["こいつは　わたしの　まご", "きみの　おさななじみであり", "ライバル　である"])
    .addMessage(["・・・えーと？", "なまえは　なんて　いったかな？"])
    .addMessage(["そうだ　そうだ！　おもいだしたぞ", "グリーン　という　なまえだ"])
    .addTime(15, (ticks) => {
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
    })
    .addTime(15, (ticks) => {
        const step = ticks / 5;
        if (ticks % 5 === 0) {
            switch (step) {
                case 1: effectLight(2); break;
                case 2: effectLight(1); break;
                case 3: effectLight(0); break;
            }
        }
    })
    .addMessage(["レッド！"])
    .addMessage(["いよいよ　これから", "きみの　ものがたりの　はじまりだ！"])
    .addMessage(["ゆめと　ぼうけんと！", "ポケット　モンスターの　せかいへ！", "レッツゴー！"])
    ;


export { scene };

