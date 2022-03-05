import type { RedactCloneOptions } from './interfaces';

import traverse = require('traverse');

import { defaults } from './defaults';

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
export class RedactClone {
	/**
	 * You can replace these and every RedactClone instance in your process will share them
	 */
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
		Object.assign(this, options || {});
		if (this.secrets.some((s) => s instanceof RegExp)) {
			Object.assign(this, {
				isSecret(this: RedactClone, key?: string) {
					if (!key) {
						return false;
					}
					return this.secrets.some((s) => {
						if (typeof s === 'string') {
							return s === key;
						}
						return s.test(key);
					});
				},
			});
		}
	}

	reduceArrays: RedactCloneOptions['reduceArrays'] =
		RedactClone.defaults.reduceArrays;
	redact: RedactCloneOptions['redact'] = RedactClone.defaults.redact;
	set secrets(v: Array<string | RegExp>) {
		this._secrets = new Set(v);
	}
	get secrets(): Array<string | RegExp> {
		return [...this._secrets.values()];
	}
	private _secrets: Set<string | RegExp> = new Set(
		RedactClone.defaults.secrets
	);

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
							this.update(redactClone.reduceArray(v));
						}
					}))(this);
			default:
				return this.redact;
		}
	}

	reduceArray<T>(arr: T[]): T[] | (string | T)[] | string {
		switch (typeof this.reduceArrays) {
			case 'boolean':
				return this._reduce(arr);
			case 'number':
				if (arr.length > this.reduceArrays) {
					const newArr: (T | string)[] = [];
					for (let i = 0; i < arr.length; i++) {
						if (i > this.reduceArrays - 1) {
							newArr.push(`...${this._reduce(arr)}`);
							break;
						}
						newArr.push(arr[i]);
					}
					return newArr;
				} else {
					return arr;
				}
			case 'function':
				return this.reduceArrays(arr);
		}
	}

	private _reduce(arr: any[]) {
		return `[Object ARRAY[${arr.length}]]`;
	}

	isSecret(key?: string) {
		return key ? this._secrets.has(key) : false;
	}
}
