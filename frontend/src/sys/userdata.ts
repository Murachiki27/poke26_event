

let username: string = "けんた";
let sessionId: string = "";

export function setUserName(name: string): void {
    username = name;
}

export function getUserName(): string {
    return username;
}

export function setSessionId(id: string): void {
    sessionId = id;
}

export function getSessionId(): string {
    return sessionId;
}

