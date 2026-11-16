import type { Screen } from "../graphics/screen";

export function addInputBox(screen: Screen, name: string, tx: number, ty: number, tw: number, th: number): HTMLInputElement {
    const inputEl = document.createElement('input');
    inputEl.classList.add('app-canvas');
    inputEl.style.position = 'absolute';
    inputEl.type = 'text';
    inputEl.name = name;
    inputEl.style.left = `${screen.tileToPixelScale(tx)}px`;
    inputEl.style.top = `${screen.tileToPixelScale(ty)}px`;
    inputEl.style.width = `${screen.tileToPixelScale(tw)}px`;
    inputEl.style.height = `${screen.tileToPixelScale(th)}px`;
    inputEl.style.border = inputEl.style.padding = '0';

    inputEl.style.fontSize = `${screen.tileToPixelScale(1)}px`;
    inputEl.style.opacity = '0';

    screen.canvas.parentElement!.appendChild(inputEl);
    return inputEl;
}

export function addButtonElement(screen: Screen, label: string, tx: number, ty: number, tw: number, th: number): HTMLButtonElement {
    const buttonEl = document.createElement('button');
    buttonEl.classList.add('app-canvas');
    buttonEl.style.position = 'absolute';
    buttonEl.textContent = label;
    buttonEl.style.left = `${screen.tileToPixelScale(tx)}px`;
    buttonEl.style.top = `${screen.tileToPixelScale(ty)}px`;
    buttonEl.style.width = `${screen.tileToPixelScale(tw)}px`;
    buttonEl.style.height = `${screen.tileToPixelScale(th)}px`;
    buttonEl.style.border = buttonEl.style.padding = '0';
    buttonEl.style.fontSize = `${screen.tileToPixelScale(1)}px`;
    buttonEl.style.opacity = '0';

    screen.canvas.parentElement!.appendChild(buttonEl);
    return buttonEl;
}

