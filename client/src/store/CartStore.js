import { makeAutoObservable } from "mobx";

export default class CartStore {
    constructor() {
        this._cartItems = [];
        this._totalItems = 0;
        this._totalPrice = 0;
        this._itemCount = 0;
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
    setItemCount(count) {
        this._itemCount = count;
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
    get itemCount() {
        return this._itemCount;
    }
}
