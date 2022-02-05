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
	reduceArrays: boolean | ((arr: any[]) => number | string);
}
