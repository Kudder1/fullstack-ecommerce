import { makeAutoObservable } from "mobx";

export default class CartStore {
    constructor() {
        this._cartItems = [];
        this._totalItems = 0;
        this._totalPrice = 0;
        this._deviceCount = 0;
        makeAutoObservable(this);
    }
    setCartItems(cartItems) {
        this._cartItems = cartItems;
    }
    setTotalItems(count) {
        this._totalItems = count;
    }
    setTotalPrice(price) {
        this._totalPrice = price;
    }
    setDeviceCount(count) {
        this._deviceCount = count;
    }
    get cartItems() {
        return this._cartItems;
    }
    get totalItems() {
        return this._totalItems;
    }
    get totalPrice() {
        return this._totalPrice;
    }
    get deviceCount() {
        return this._deviceCount;
    }
}
