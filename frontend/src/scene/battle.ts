import { AUDIO } from "../audio/audio";
import type { Screen } from "../graphics/screen";
import { drawTextUI } from "../graphics/ui";
import { register, roomCreate, roomJoin, roomList, roomReady } from "../socket/room";
import { wsClose, wsConnect, wsSend, type Data, type ResponseData } from "../socket/socket";
import { createWindow, deleteWindow, setActiveWindow } from "../sys/msgbox";
import { UIBase, UIButton, UIInput, UISelector } from "../sys/uibase";
import { getSessionId, getUserName, setSessionId } from "../sys/userdata";
import { createEventScene, input, EventScene, selector, selectorFunc, setScene, wait, Scene, registerScene } from "./scene";

export const ID = "battle";

let fetchRooms = false;
let rooms: string[] = [];

let roomElId = -1;

let loading: boolean = false;


let sessionId: string | null = null;


function on(data: ResponseData): void {
    switch (data.type) {
        case "user_created":
            sessionId = data.session_id;
            break;
        
        case "room_list":
            for (const room of data.rooms) {
                rooms.push(room.id + ":" + room.name);
            }
            loading = false;
            break;
    }
}

class RoomScene extends Scene {

    private loading: boolean = false;
    private rooms: string[] = [];

    private fetchRoomList: boolean = false;

    private userNameUI: UIInput;

    private newRoomBtn: UIButton;
    private roomListUI: UISelector;
    private roomNameInputUI: UIInput;
    private roomCreateUI: UIButton;

    private roomCodeUI: UIInput;
    private roomJoinUI: UIButton;

    private readyUI: UIButton;

    private uiList: UIBase[];

    private msgLines: string[] = [];

    private roomName: string | null = null;
    private roomCode: string | null = null;
    private roomUsers: string[] = [];

    private ready: boolean = false;

    constructor(screen: Screen) {
        super();
        this.newRoomBtn = new UIButton(screen, { label: { value: 'ルームをつくる', tx: 6, ty: 3 }, tx: 5, ty: 1, tileWidth: 9, tileHeight: 5 });
        this.newRoomBtn.addClickEvent(() => {
            this.roomNameInputUI.show();
            this.roomCreateUI.show();
            AUDIO.se.ok.play();
        });
        this.roomListUI = new UISelector({ items: [], tx: 0, ty: 8, tileWidth: 20, tileHeight: 20 });
        this.roomListUI.setClickEvent((index) => {
            this.roomCodeUI.show();
            this.roomJoinUI.show();
        });

        this.roomNameInputUI = new UIInput(screen, { name: ' へや の なまえ ', tx: 2, ty: 15, tileWidth: 16, tileHeight: 5, maxLength: 10 });
        this.roomNameInputUI.hide();

        this.roomCreateUI = new UIButton(screen, { label: { value: 'へや を つくる', tx: 6, ty: 22 }, tx: 5, ty: 20, tileWidth: 9, tileHeight: 5 });
        this.roomCreateUI.addClickEvent(() => {
            if (this.roomNameInputUI.getText().length < 3) {
                this.msgLines = ["へや の なまえ は", "3もじ から 10もじ で きめてね!"];
            } else {
                this.msgLines = [];
                wsSend(roomCreate(getSessionId(), this.roomNameInputUI.getText()));
                this.roomNameInputUI.hide();
                this.roomCreateUI.hide();
                this.roomListUI.hide();
                this.newRoomBtn.hide();

                this.readyUI.show();

                AUDIO.se.ok.play();
            }
        });
        this.roomCreateUI.hide();

        this.roomCodeUI = new UIInput(screen, { name: ' へや の コード ', tx: 2, ty: 15, tileWidth: 16, tileHeight: 5, maxLength: 10 });
        this.roomCodeUI.hide();

        this.roomJoinUI = new UIButton(screen, { label: { value: 'へや を つくる', tx: 6, ty: 22 }, tx: 5, ty: 20, tileWidth: 9, tileHeight: 5 });
        this.roomJoinUI.addClickEvent(() => {
            if (this.roomCodeUI.getText().length < 6) {
                this.msgLines = ["へや の コード は", "6もじ だよ!"];
            } else {
                this.msgLines = [];
                wsSend(roomJoin(getSessionId(), this.roomCodeUI.getText()));

                this.roomCodeUI.hide();
                this.roomJoinUI.hide();
                this.roomListUI.hide();
                this.newRoomBtn.hide();

                this.readyUI.show();

                AUDIO.se.ok.play();
            }
        });
        this.roomJoinUI.hide();

        this.readyUI = new UIButton(screen, { label: { value: 'OK', tx: 7, ty: 24 }, tx: 6, ty: 22, tileWidth: 6, tileHeight: 5 });
        this.readyUI.addClickEvent(() => {
            this.ready = !this.ready;
            wsSend(roomReady(getSessionId(), this.ready));
            AUDIO.se.ok.play();
        });
        this.readyUI.hide();

        this.userNameUI = new UIInput(screen, { name: 'name', tx: 2, ty: 30, tileWidth: 16, tileHeight: 5, maxLength: 8 });
        this.userNameUI.setText(getUserName());

        this.uiList = [
            this.newRoomBtn,
            this.roomListUI,
            this.roomNameInputUI,
            this.roomCreateUI,

            this.roomCodeUI,
            this.roomJoinUI,

            this.readyUI,
            this.userNameUI,
        ];
    }

    public override onStart(): void {
        wsConnect({
            open: () => { this.onWsOpen() },
            message: (ev) => { this.onWsMessage(ev) },
        });
    }

    public override onEnd(): void {
        wsClose();
    }

    public override render(screen: Screen): void {
        this.uiList.forEach(ui => ui.render(screen));

        if (this.roomName !== null) {
            drawTextUI(screen, "へや の なまえ", 4, 2);
            drawTextUI(screen, this.roomName, 4, 4);
        }

        if (this.roomCode !== null) {
            drawTextUI(screen, "へや の コード", 4, 7);
            drawTextUI(screen, this.roomCode, 4, 9);
        }

        let userIdx = 0;
        for (const roomUser of this.roomUsers) {
            drawTextUI(screen, roomUser, 1, 12 + userIdx * 3);
            userIdx++;
        }



        let i = 0;
        for (const msg of this.msgLines) {
            drawTextUI(screen, msg, 0, 26 + i * 2);
            i++;
        }
    }

    public override update(screen: Screen, now: number): void {
        this.uiList.forEach(ui => ui.update());

        if (this.fetchRoomList) {
            this.fetchRoomList = false;
            wsSend(roomList(getSessionId()));
            this.loading = true;
        }
    }

    public override click(screen: Screen, x: number, y: number): void {
        this.uiList.forEach(ui => ui.pointerDown(x, y));
    }

    private onWsOpen(): void {
        wsSend(register(this.userNameUI.getText()));
    }

    private onWsMessage(data: ResponseData): void {
        switch (data.type) {
            case "user_created":
                setSessionId(data.session_id);
                this.fetchRoomList = true;
                wsSend(roomList(getSessionId()));
                this.loading = true;
                break;
            
            case "room_list":
                this.rooms = [];
                for (const room of data.rooms) {
                    this.rooms.push(room.id + ":" + room.name);
                }
                this.loading = false;

                this.roomListUI.setItems(this.rooms);
                // this.roomListId = createWindow(this);
                // setActiveWindow(this.roomListId);
                break;
            
            case "room_created":
                this.roomCode = data.code;
                this.roomName = data.name;
                break;
            
            case "room_user_updated":
                this.roomUsers = [];
                for (const user of data.users) {
                    this.roomUsers.push(user.id + ":" + user.name + " @ " + (user.ready ? "OK!" : ""));
                }
                break;
        }
    }
}

registerScene(ID, (screen) => new RoomScene(screen));

// export const scene = createEventScene([
//     selector({ items: ["ばなな", "りんご"], tx: 1, ty: 1, tileWidth: 10, tileHeight: 16 }, (index) => {
//         // const response = await fetch('/api/room.php', {
//         //     method: 'GET',
//         //     headers: {
//         //     'Content-Type': 'application/json', // Content-TypeをJSONに変更
//         //     },
//         //     body: JSON.stringify({ ans: trimmedInput }), // オブジェクトをJSON文字列に変換
//         // });

//         wsConnect(on);
//         wsSend(register("けいた"));
//         // fetch(`/api/room`)
//         //     .then(res => {
//         //         return res.json();
//         //     }).then(data => {
//         //         rooms = [];
//         //         for (const dat of data) {
//         //             rooms.push(dat.id + ":" + dat.name);
//         //         }
//         //         fetchRooms = true;
//         //     }
//         // );
//     }),
//     wait(() => {
//         if (sessionId !== null) {
//             wsSend(roomList(sessionId));
//             loading = true;
//             return false;
//         }
//         return true;
//     }),
//     wait(() => {
//         if (sessionId !== null) {
//             wsSend(roomList(sessionId));
//             loading = true;
//             return false;
//         }
//         return true;
//     }),
//     wait(() => loading),

    
//     selectorFunc((screen) => { return { items: rooms, tx: 0, ty: 2, tileWidth: 16, tileHeight: 20, showAfter: true } }, (index, elId) => {
//         roomElId = elId;
//     }),
//     input({
//         input: { name: 'ルームコード', tx: 1, ty: 6, tileWidth: 14, tileHeight: 5, maxLength: 6 },
//         button: { label: { value: 'けってい', tx: 6, ty: 12 }, tx: 5, ty: 11, tileWidth: 6, tileHeight: 3 },
//     }, (value) => {
        
//         deleteWindow(roomElId);
//     }),

    
// ], () => {
//     wsClose();
// });



