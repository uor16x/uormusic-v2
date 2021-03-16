export const ToastService = {
    successCallbacks: [],
    infoCallbacks: [],
    errCallbacks: [],

    subscribeSuccess(fn) {
        this.successCallbacks.push(fn);
    },
    subscribeInfo(fn) {
        this.infoCallbacks.push(fn);
    },
    subscribeErr(fn) {
        this.errCallbacks.push(fn);
    },

    publishSuccess(text) {
        this.successCallbacks.forEach(fn => fn(text));
    },
    publishInfo(text) {
        this.infoCallbacks.forEach(fn => fn(text));
    },
    publishErr(text) {
        this.errCallbacks.forEach(fn => fn(text));
    }
}