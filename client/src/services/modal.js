export const ModalService = {
    callbacks: [],

    subscribe(fn) {
        this.callbacks.push(fn);
    },
    publish(data) {
        this.callbacks.forEach(fn => fn(data));
    }
}