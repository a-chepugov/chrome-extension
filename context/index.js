(async () => {
	const { recognise } = await import('../lib/recognise.js').catch(console.error) ?? {};
	const { tap, tapThrow } = await import('../lib/tap.js').catch(console.error) ?? {};

	const insertText = (text, input) => {
		const startPosition = input.selectionStart;
		const endPosition = input.selectionEnd;
		const oldText = input.value;
		const newText = oldText.substring(0, startPosition) + text + oldText.substring(endPosition);
		input.value = newText;
		return newText;
	};

	const handlers = {
		'insert into input': (text) => insertText(text, document.activeElement),
		'recognize & insert': async () => {
			const recognized = await recognise('ru');
			const text = recognized?.results?.[0]?.[0]?.transcript;
			return insertText(text, document.activeElement);
		},
		'recognize & return': async () => {
			const recognized = await recognise('ru');
			return recognized?.results?.[0]?.[0]?.transcript;
		},
	};

	function fail(message) {
		throw new Error(message);
	}

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		const { topic, payload }= message ?? {};

		Promise
			.resolve(payload)
			.then(topic in handlers
				? handlers[topic]
				: fail(`invalid topic: ${topic}`)
			)
			.then(tap(console.info), tapThrow(console.error))
			.then(
				(data = {}) => sendResponse({ data }),
				(error = {}) => sendResponse({ error })
			);
		return true;
	});

	console.log(`context registered`);
})();
