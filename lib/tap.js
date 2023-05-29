export function tap(fn) {
	return function(payload) {
		setTimeout(() => fn.call(this, payload), 0);
		return payload;
	};
}

export function tapThrow(fn) {
	return function(error) {
		setTimeout(() => fn.call(this, error), 0);
		throw error;
	};
}

