import { v4 } from 'uuid'

export const UploadService = {
    queue: [],
    callbacks: [],

    setStatus(id, status) {},

    add(name) {
        const id = v4()
        this.queue = [
            { id: id, status: 'Added', name },
            ...this.queue
        ]
        this.publish()
        return id
    },

    subscribe(fn) {
        this.callbacks.push(fn);
    },
    publish(data) {
        this.callbacks.forEach(fn => fn(data));
    }
}