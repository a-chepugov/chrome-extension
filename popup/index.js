import ChromeStorage from '../lib/Storage/ChromeStorage.js';

const drawStorageView = async (storage, root) => {
	const entries = await storage.entries();

	entries
		.forEach(([key, value]) => {
			const itemRow = document.createElement('tr');

			const itemActionsCell = document.createElement('td');
			const closeButton = document.createElement('button');
			closeButton.innerHTML = 'x';
			closeButton.addEventListener('click', () => {
				storage.del(key);
			});
			itemActionsCell.appendChild(closeButton);
			itemRow.appendChild(itemActionsCell);

			const itemKeyCell = document.createElement('td');
			const itemKeyInput = document.createElement('input');
			itemKeyInput.value = key;
			itemKeyInput.addEventListener('change', (event) => {
				storage.del(key);
				const newKey = event.target.value;
				storage.set(newKey, value);
			});
			itemKeyCell.appendChild(itemKeyInput);
			itemRow.appendChild(itemKeyCell);

			const itemValueCell = document.createElement('td');
			const itemValueTextarea = document.createElement('textarea');
			itemValueTextarea.value = value;
			itemValueTextarea.style.maxHeight = '15em';
			itemValueTextarea.addEventListener('change', (event) => {
				const newValue = event.target.value;
				storage.set(key, newValue);
			});

			itemValueCell.appendChild(itemValueTextarea);
			itemRow.appendChild(itemValueCell);

			root.appendChild(itemRow);
		});
};

const storageSync = ChromeStorage.sync();
const syncItemsTable = document.getElementById('storage-sync-items');
drawStorageView(storageSync, syncItemsTable);

const storageLocal = ChromeStorage.local();
const localItemsTable = document.getElementById('storage-local-items');
drawStorageView(storageLocal, localItemsTable);

//--------------------------------------------------

document
	.getElementById('site-cache')
	.addEventListener('submit', (event) => {
		event.preventDefault();
		chrome.tabs.query({ lastFocusedWindow: true, active: true }, (tabs) => {
			const [tab] = tabs;
			chrome.tabs.create({ url: `https://google.com/search?q=cache:${tab.url}` });
		});
	});

document
	.getElementById('site-search')
	.addEventListener('submit', (event) => {
		event.preventDefault();
		const parameters = event.target.parameters.value;

		chrome.tabs.query({ lastFocusedWindow: true, active: true }, (tabs) => {
			const [tab] = tabs;
			const hostname = (new URL(tab.url)).hostname;
			chrome.tabs.create({ url: `https://google.com/search?q=${parameters} site:${hostname}` });
		});
	});
