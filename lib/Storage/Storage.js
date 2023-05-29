/**
 */
export class Storage {
	_data;
	constructor() {
		this._data = new Map();
		Object.seal(this);
	}
	get(key) {
		return this._data.get(key);
	}
	set(key, value) {
		this._data.set(key, value);
		return this;
	}
	del(key) {
		this._data.delete(key);
		return this;
	}
	has(key) {
		return this._data.has(key);
	}
	clear() {
		this._data.clear();
		return this;
	}
	keys() {
		return this._data.keys();
	}
	values() {
		return this._data.values();
	}
	entries() {
		return this._data.entries();
	}
	[Symbol.iterator]() {
		return this.values();
	}
	size() {
		return this._data.size;
	}
	static from(entries) {
		const storage = new Storage();
		Array.from(entries)
			.forEach(([key, value]) => {
				storage.set(key, value);
			});
		return storage;
	}
}
export default Storage;
