import type { RedactCloneOptions } from './interfaces';

import traverse = require('traverse');

import { defaults } from './defaults';

class Set<T extends string | number | symbol> {
	constructor(public arr: T[]) {
		this._map = {} as Record<T, 1>;
		for (const i of arr) {
			this._map[i] = 1;
		}
	}

	has(key: string) {
		return key in this._map;
	}

	private _map: Record<T, 1>;
}

/**
 * @example
 * ```ts
 * const redactor = RedactClone.create('[SHH!]');
 * const someInput = {
 * 	username: 'moojig',
 * 	password: 'DefinitelyNotMyRealPassword'
 * };
 * // logs: { username: 'moojig', password: '[SHH!]' }`
 * console.log(redactor.censor(someInput));
 * // Makes deep clone so the original object is unmodified
 * // logs: { username: 'moojig', password: 'DefinitelyNotMyRealPassword' }
 * console.log(someInput)
 * ```
 */
export default class RedactClone {
	static defaults = defaults;
	/**
	 * Create a RedactClone instance
	 */
	static create(redactWith: string): RedactClone;
	static create(options?: Partial<RedactCloneOptions>): RedactClone;
	static create(arg0?: string | Partial<RedactCloneOptions>) {
		if (typeof arg0 === 'string') {
			arg0 = {
				redact: arg0,
			};
		}
		return new this(arg0);
	}

	constructor(options?: Partial<RedactCloneOptions>) {
		for (const k in options || {}) {
			// @ts-ignore
			this[k] = options[k];
		}
	}

	reduceArrays: RedactCloneOptions['reduceArrays'] =
		RedactClone.defaults.reduceArrays;
	redact: RedactCloneOptions['redact'] = RedactClone.defaults.redact;
	set secrets(v: string[]) {
		this._secrets = new Set(v);
	}
	get secrets(): string[] {
		return this._secrets.arr;
	}
	private _secrets = new Set(RedactClone.defaults.secrets);

	censor(object: any) {
		switch (typeof object) {
			case 'object':
				return ((redactClone: RedactClone) =>
					traverse.map(object, function (v) {
						if (redactClone.isSecret(this.key)) {
							switch (typeof redactClone.redact) {
								case 'string':
									this.update(redactClone.redact);
									break;
								case 'function':
									this.update(redactClone.redact([this.key, v]));
							}
						}
						if (v instanceof Array && redactClone.reduceArrays) {
							switch (typeof redactClone.reduceArrays) {
								case 'boolean':
									this.update(`Array[${v.length}]`);
									break;
								case 'function':
									this.update(redactClone.reduceArrays(v));
							}
						}
					}))(this);
			default:
				return this.redact;
		}
	}

	isSecret(key?: string) {
		return key ? this._secrets.has(key) : false;
	}
}
