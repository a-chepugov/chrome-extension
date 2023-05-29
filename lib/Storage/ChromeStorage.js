/**
 * @description adapt chrome.storage to KVStorage interface
 */
export class ChromeStorageAdapter {
	constructor(storage) {
		this.storage = storage;
	}
	get size() {
		return this.storage.get(null)
			.then((result) => Object.keys(result).length);
	}
	get(key) {
		return this.storage.get([key])
			.then((result) => result?.[key]);
	}
	set(key, value) {
		return this.storage.set({ [key]: value })
			.then(() => this);
	}
	del(key) {
		return this.storage.remove(key)
			.then(() => this);
	}
	has(key) {
		return this.get(key)
			.then((value) => value !== undefined);
	}
	keys() {
		return this.storage.get(null)
			.then((result) => Object.keys(result));
	}
	values() {
		return this.storage.get(null)
			.then((result) => Object.values(result));
	}
	entries() {
		return this.storage.get(null)
			.then((result) => Object.entries(result));
	}
	clear() {
		this.storage.clear();
	}

	static new(storage = chrome.storage.local) {
		return new ChromeStorageAdapter(storage);
	}

	static local = () =>
		new ChromeStorageAdapter(chrome.storage.local);

	static sync = () =>
		new ChromeStorageAdapter(chrome.storage.sync);

}

export default ChromeStorageAdapter;

