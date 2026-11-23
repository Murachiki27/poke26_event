

let socket: WebSocket | null = null;


function onMessage(event: MessageEvent<any>): void {
    
}

export type Data = {
    type: string;
};

export type UserCreatedData = {
    type: 'user_created';
    session_id: string;
};

export type RoomListData = {
    type: 'room_list';
    rooms: {
        id: number;
        name: string;
        count: number;
    }[];
};

export type RoomCreatedData = {
    type: 'room_created';
    name: string;
    code: string;
};

export type RoomUserUpdatedData = {
    type: 'room_user_updated';
    users: {
        id: number;
        name: string;
        ready: boolean;
    }[];
};

export type ResponseData = UserCreatedData | RoomListData | RoomCreatedData | RoomUserUpdatedData;

type WsOption = {
    open?: () => void;
    close?: () => void;
    message?: (data: ResponseData) => void;
    error?: () => void;
};

export function wsConnect(option: WsOption): void {
    if (socket && socket.readyState === WebSocket.OPEN) {
        return;
    }
    socket = new WebSocket('ws://192.168.11.32/ws/');

    socket.addEventListener("open", () => {
        console.log("[WebSocket] open");
        option.open?.();
    });

    socket.addEventListener("message", (event) => {
        console.log("[WebSocket] message", event.data);
        const msg = JSON.parse(event.data) as ResponseData;
        option.message?.(msg);
    });
    socket.addEventListener("close", (event) => {
        console.log("[WebSocket] close");
        option.close?.();
    });

    socket.addEventListener("error", (event) => {
        console.log("[WebSocket] error");
        option.error?.();
    });
};

export function wsSend(data: Data): void {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("WebSocketが接続されていません");
        return;
    }
    console.log("[WebSocket] send", data);
    socket.send(JSON.stringify(data));
}

export function wsClose(): void {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("WebSocketが接続されていません");
        return;
    }
    console.log("[WebSocket] closing");
    socket.close();
}

