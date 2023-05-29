const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
export const recognise = (lang) => new Promise((resolve, reject) => {
	const recognition = new SpeechRecognition();
	recognition.lang = lang;

	recognition.onresult = resolve;
	recognition.onerror = reject;
	recognition.start();
});

export default recognise;

