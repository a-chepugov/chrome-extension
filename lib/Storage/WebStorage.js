/**
 * @description adapt localStorage to KVStorage interface
 */
export class WebStorageAdapter {
	constructor(storage) {
		this.storage = storage;
	}
	get size() {
		return this.storage.length;
	}
	get(key) {
		return this.storage.getItem(key);
	}
	set(key, value) {
		this.storage.setItem(key, value);
		return this;
	}
	del(key) {
		this.storage.removeItem(key);
		return this;
	}
	has(key) {
		return this.storage.getItem(key) !== undefined;
	}
	keys() {
		const length = this.storage.length;
		const keys = new Array(length);
		for (let i = 0; i < length; i++) {
			keys[i] = this.torage.key(i);
		}
		return keys;
	}
	clear() {
		this.storage.clear();
	}
	static local = () => new WebStorageAdapter(localStorage);

	static session = () => new WebStorageAdapter(sessionStorage);
}

export default WebStorageAdapter;
