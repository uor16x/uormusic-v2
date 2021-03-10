module.exports = app => class Queue {
	constructor(input = [], concurrency = 3, result = []) {
		this.concurrency = concurrency
		this.input = input
	}

	async exec() {

	}
}
