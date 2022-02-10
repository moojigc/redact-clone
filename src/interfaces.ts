export interface RedactCloneOptions {
	secrets: string[];
	/**
	 * @default "[REDACTED]"
	 */
	redact:
		| string
		| ((
				node: [string | number | symbol | undefined, any]
		  ) => string | number | boolean);
	/**
	 * If number, reduce when array length is greater
	 */
	reduceArrays: boolean | number | ((arr: any[]) => number | string);
}
