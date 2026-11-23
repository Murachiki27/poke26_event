import type { Data } from "./socket";

export type RegisterData = Data & {
    type: 'register';
    username: string;
}

export function register(username: string): RegisterData {
    return { type: "register", username };
}

export type SessionData = Data & {
    session_id: string;
}

export type RoomListData = SessionData & {
    type: 'rooms';
}

export type RoomCreateData = SessionData & {
    type: 'create';
    name: string;
}

export type RoomJoinData = SessionData & {
    type: 'join';
    code: string;
}

export type RoomReadyData = SessionData & {
    type: 'ready';
    state: boolean;
}

export function roomList(session_id: string): RoomListData {
    return { type: "rooms", session_id };
}

export function roomCreate(session_id: string, name: string): RoomCreateData {
    return { type: "create", session_id, name };
}

export function roomJoin(session_id: string, code: string): RoomJoinData {
    return { type: "join", session_id, code };
}

export function roomReady(session_id: string, state: boolean): RoomReadyData {
    return { type: "ready", session_id, state };
}


