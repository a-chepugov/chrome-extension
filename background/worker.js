import ChromeStorage from '../lib/Storage/ChromeStorage.js';
import Storage from '../lib/Storage/Storage.js';
import { tap, tapThrow } from '../lib/tap.js';

const storageSync = ChromeStorage.sync();
const storageLocal = ChromeStorage.local();

const KEY_SLICE = 19;

const menuItems = {
	'recognize & insert': {
		title: 'наболтать сюда',
		type: 'normal',
		contexts: ['editable'],
		handler: (info, tab) => {
			chrome.tabs
				.sendMessage(tab.id, {
					topic: 'recognize & insert',
				})
				.then(tap(console.info), tapThrow(console.error));
		},
	},
	'recognize & save': {
		title: 'наболтать и запомнить',
		type: 'normal',
		contexts: ['page', 'link', 'selection', 'editable'],
		handler: (info, tab) => {
			chrome.tabs
				.sendMessage(tab.id, {
					topic: 'recognize & return',
				})
				.then(tap(console.info), tapThrow(console.error))
				.then(({ data }) => {
					if (typeof data === 'string') {
						storageLocal.set(data.slice(0, KEY_SLICE), data);
					}
				})
			;
		},
	},
	'google~define': {
		title: 'google define',
		type: 'normal',
		contexts: ['selection'],
		handler: (info) => {
			chrome.tabs.create({ url: `https://google.com/search?q=define:${info.selectionText}` });
		},
	},
	'storage~save': {
		title: 'сохранить',
		type: 'normal',
		contexts: ['selection'],
	},
	'storage>sync~save': {
		parentId: 'storage~save',
		title: 'sync',
		type: 'normal',
		contexts: ['selection'],
		handler: (info) => {
			storageSync.set(info.selectionText.slice(0, KEY_SLICE), info.selectionText);
		},
	},
	'storage>local~save': {
		parentId: 'storage~save',
		title: 'local',
		type: 'normal',
		contexts: ['selection'],
		handler: (info) => {
			storageLocal.set(info.selectionText.slice(0, KEY_SLICE), info.selectionText);
		},
	},
	'storage~restore': {
		title: 'вставить',
		type: 'normal',
		contexts: ['editable'],
	},
};

const menuClickHandlers = Storage.from(Object
	.entries(menuItems)
	.filter(([, config]) => config.handler)
	.map(([id, config]) => [id, config.handler])
);

const updateBadgeCounter = async () => {
	const syncEntries = await storageSync.entries();
	const localEntries = await storageLocal.entries();
	const entriesCount = (syncEntries.length + localEntries.length) || 0;
	chrome.action.setBadgeText({ text: `${entriesCount}` });
};

const insertHandlerFactory = (value) => {
	return (info, tab) => {
		chrome.tabs
			.sendMessage(tab.id, {
				topic: 'insert into input',
				payload: value,
			})
			.then(tap(console.info), tapThrow(console.error));
	};
};

chrome.runtime.onInstalled.addListener(async (details) => {
	console.info(`installed:`,	details.reason);

	Object.entries(menuItems)
		.forEach(([id, item]) => {
			chrome.contextMenus.create({
				id,
				parentId: item.parentId,
				title: item.title,
				type: item.type,
				contexts: item.contexts,
			});
		});

	updateBadgeCounter();

	const syncEntries = await storageSync.entries();
	const localEntries = await storageLocal.entries();

	syncEntries
		.forEach(([key, value]) => {
			const fullId = `storage>sync~restore:${key}` ;

			menuClickHandlers.set(fullId, insertHandlerFactory(value));

			chrome.contextMenus.create({
				id: fullId,
				parentId: 'storage~restore',
				title: `sync: ${key}`,
				type: 'normal',
				contexts: ['editable'],
			});
		});

	localEntries
		.forEach(([key, value]) => {
			const fullId = `storage>local~restore:${key}` ;

			menuClickHandlers.set(fullId , insertHandlerFactory(value));

			chrome.contextMenus.create({
				id: fullId,
				parentId: 'storage~restore',
				title: `local: ${key}`,
				type: 'normal',
				contexts: ['editable'],
			});
		});
	console.info(`onInstallaled finished`);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (menuClickHandlers.has(info.menuItemId)) {
		menuClickHandlers.get(info.menuItemId)(info, tab);
	}
});

chrome.storage.onChanged.addListener(async (changes, namespace) => {
	updateBadgeCounter();

	for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
		const fullId = `storage>${namespace}~restore:${key}`;

		if (newValue === undefined) {
			menuClickHandlers.del(fullId);
			chrome.contextMenus.remove(fullId);
		} else {
			if (oldValue !== undefined) {
				menuClickHandlers.del(fullId);
				chrome.contextMenus.remove(fullId);
			}
			chrome.contextMenus.create({
				id: fullId,
				parentId: 'storage~restore',
				title: `${namespace}: ${key}`,
				type: 'normal',
				contexts: ['editable'],
			});
			menuClickHandlers.set(fullId , insertHandlerFactory(newValue));
		}
	}
});
