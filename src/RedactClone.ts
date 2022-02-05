import traverse = require('traverse');
import { defaults } from './defaults';

interface RedactCloneOptions {
	secrets: string[];
	/**
	 * @default "[REDACTED]"
	 */
	redact: string;
	reduceArrays: boolean;
}

/**
 * @example
 * ```ts
 * const redactor = RedactClone.create('[SHH!]');
 * const someInput = {
 * 	username: 'moojig',
 * 	password: 'DefinitelyNotMyRealPassword'
 * };
 * // logs: { username: 'moojig', password: '[SHH!]' }
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
		Object.assign(this, options || {});
	}

	reduceArrays = RedactClone.defaults.reduceArrays;
	redact = RedactClone.defaults.redact;
	set secrets(v: string[] | Set<string>) {
		if (v instanceof Set) {
			this._secrets = v;
		} else {
			this._secrets = new Set(v);
		}
	}
	get secrets(): Set<string> {
		return this._secrets;
	}
	private _secrets = new Set(RedactClone.defaults.secrets);

	censor(object: any) {
		switch (typeof object) {
			case 'object':
				return ((redactClone: RedactClone) =>
					traverse.map(object, function (v) {
						if (redactClone.isSecret(this.key)) {
							this.update(redactClone.redact);
						}
						if (v instanceof Array && redactClone.reduceArrays) {
							this.update(v.length);
						}
					}))(this);
			default:
				return this.redact;
		}
	}

	isSecret(key?: string) {
		return key ? this.secrets.has(key) : false;
	}
}
