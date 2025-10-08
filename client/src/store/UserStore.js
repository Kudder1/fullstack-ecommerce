import { makeAutoObservable } from "mobx";

// TODO use _ fields
export default class UserStore {
    constructor() {
        this._isAuth = false;
        this._user = {};
        makeAutoObservable(this);
        // mobx will watch the changes of the variables and will re-render the components
        // that are using these variables
    }
    setIsAuth(bool) {
        this._isAuth = bool;
    }
    setUser(user) {
        this._user = user;
    }
    get isAuth() { //computed functions runs only of _isAuth changes
        return this._isAuth;
    }
    get user() {
        return this._user;
    }
}