import type { RedactCloneOptions } from './interfaces';

export const defaults: RedactCloneOptions = {
	secrets: [
		'password',
		'pass',
		'socialSecurityNumber',
		'ssn',
		'secret',
		'clientSecret',
		'token',
	],
	redact: '[REDACT]',
	reduceArrays: false,
};
