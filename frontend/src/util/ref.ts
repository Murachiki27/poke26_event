
export class DefferedConst<T> {
    private _value: T | null = null;
    constructor() {}

    get value(): T {
        if (this._value === null) {
            throw new Error("Value is not set yet.");
        }
        return this._value;
    }

    set value(val: T) {
        if (this._value !== null) {
            throw new Error("Value is already set.");
        }
        this._value = val;
    }
}
