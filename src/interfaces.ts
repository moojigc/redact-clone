export interface RedactCloneOptions {
	secrets: string[];
	/**
	 * @default "[REDACTED]"
	 */
	redact: string;
	reduceArrays: boolean;
}
