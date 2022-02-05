import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';

import RedactClone from '../src/RedactClone';

_chai.should();
@suite
class RedactCloneTests {
	static CENSOR = 'SHH!';
	private SUT: RedactClone;

	before() {
		this.SUT = RedactClone.create(RedactCloneTests.CENSOR);
	}

	@test
	'should have default properties'() {
		this.SUT.should.not.be.undefined;
		this.SUT.redact.should.be.equal(RedactCloneTests.CENSOR);
		this.SUT.reduceArrays.should.equal(RedactClone.defaults.reduceArrays);
		this.SUT.secrets.should.be.deep.equal(
			new Set(RedactClone.defaults.secrets)
		);
		this.SUT.should.haveOwnProperty('redact');
		this.SUT.isSecret('secret').should.equal(true);
	}

	@test
	'should censor plain string'() {
		for (const str of RedactClone.defaults.secrets) {
			this.SUT.isSecret(str).should.be.eq(true);
			this.SUT.censor(str).should.be.equal(RedactCloneTests.CENSOR);
		}
	}

	@test
	'should censor shallow object'() {
		const input = {
			name: 'User',
			password: 'Password',
			socialSecurityNumber: '00000000',
			token: 'asld;kfjawa3buiifhewljfa32v',
		};
		const expected = {
			name: 'User',
			password: RedactCloneTests.CENSOR,
			socialSecurityNumber: RedactCloneTests.CENSOR,
			token: RedactCloneTests.CENSOR,
		};

		this.SUT.censor(input).should.be.deep.equal(expected);
	}

	@test
	'should censor all nested objects'() {
		const input = {
			name: 'User',
			secrets: {
				superSecret: {
					password: 'Password',
					socialSecurityNumber: '00000000',
					token: 'asld;kfjawa3buiifhewljfa32v',
				},
				password: 'Password',
				socialSecurityNumber: '00000000',
				token: 'asld;kfjawa3buiifhewljfa32v',
			},
		};
		const expected = {
			name: 'User',
			secrets: {
				superSecret: {
					password: RedactCloneTests.CENSOR,
					socialSecurityNumber: RedactCloneTests.CENSOR,
					token: RedactCloneTests.CENSOR,
				},
				password: RedactCloneTests.CENSOR,
				socialSecurityNumber: RedactCloneTests.CENSOR,
				token: RedactCloneTests.CENSOR,
			},
		};

		this.SUT.censor(input).should.be.deep.equal(expected);
	}

	@test
	'should not modify original object'() {
		const input = {
			name: 'User',
			password: 'Password',
			socialSecurityNumber: '00000000',
			token: 'asld;kfjawa3buiifhewljfa32v',
		};

		const output = this.SUT.censor(input);

		Object.is(input, output).should.be.eq(false);
	}
}
