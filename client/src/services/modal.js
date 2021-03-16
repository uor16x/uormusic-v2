export const ModalService = {
    callbacks: [],
    closeCb: () => {},

    setCloseCb(cb) {
        this.closeCb = cb
    },

    subscribe(fn) {
        this.callbacks.push(fn);
    },
    publish(data) {
        this.callbacks.forEach(fn => fn(data));
    }
}