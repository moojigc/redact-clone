export interface RedactCloneOptions {
	secrets: Array<string | RegExp>;
	/**
	 * What you wanna hide yo secrets with
	 * For extra fun you can use an 🤫
	 * @default "[REDACTED]"
	 */
	redact:
		| string
		| ((
				node: [string | number | symbol | undefined, any]
		  ) => string | number | boolean);
	/**
	 * - If number, reduce when array length is greater.
	 * - {true} will replace every array with a string summary.
	 * - Else you can pass a function whose return value will replace the array
	 */
	reduceArrays: boolean | number | ((arr: any[]) => any);
}
