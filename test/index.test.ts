import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';

import RedactClone from '../src/RedactClone';

_chai.should();
@suite
class RedactCloneTests {
	CENSOR = 'SHH!';
	private SUT: RedactClone;
	private SUT2: RedactClone;
	private SUT3: RedactClone;

	before() {
		this.SUT = RedactClone.create(this.CENSOR);
		this.SUT2 = RedactClone.create({
			redact: this.CENSOR,
			reduceArrays: (arr) => `ARR[${arr.length}]`,
			secrets: ['password', 'secrets'],
		});
		this.SUT3 = RedactClone.create();
	}

	@test
	'should have default properties'() {
		this.SUT.should.not.be.undefined;
		this.SUT.redact.should.be.equal(this.CENSOR);
		this.SUT2.redact.should.be.equal(this.CENSOR);
		this.SUT3.redact.should.be.equal(RedactClone.defaults.redact);
		this.SUT.reduceArrays.should.equal(RedactClone.defaults.reduceArrays);
		this.SUT.secrets.should.be.deep.equal(
			new Set(RedactClone.defaults.secrets)
		);
		this.SUT.should.haveOwnProperty('redact');
		this.SUT.isSecret('secret').should.equal(true);
	}

	@test
	'secret setter should work'() {
		const arr = ['password', 'token'];
		this.SUT.secrets = arr;
		this.SUT.secrets.should.be.deep.equal(new Set(arr));
		this.SUT.secrets = new Set(arr);
		this.SUT.secrets.should.be.deep.equal(new Set(arr));
		this.SUT.secrets = RedactClone.defaults.secrets;
	}

	@test
	'should censor plain string'() {
		for (const str of RedactClone.defaults.secrets) {
			this.SUT.isSecret(str).should.be.eq(true);
			this.SUT.censor(str).should.be.equal(this.CENSOR);
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
			password: this.CENSOR,
			socialSecurityNumber: this.CENSOR,
			token: this.CENSOR,
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
					password: this.CENSOR,
					socialSecurityNumber: this.CENSOR,
					token: this.CENSOR,
				},
				password: this.CENSOR,
				socialSecurityNumber: this.CENSOR,
				token: this.CENSOR,
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

	@test
	'redact as a function should work'() {
		this.SUT.redact = ([key, value]) => {
			return String(value).length;
		};

		const output = this.SUT.censor({
			name: 'User',
			password: 'Password',
		});

		output.should.be.deep.equal({
			name: 'User',
			password: 'Password'.length,
		});
		// return to string for rest of tests
		this.SUT.redact = this.CENSOR;
	}

	@test
	'objects should also be redacted'() {
		this.SUT.censor({
			user: 'User',
			password: {
				data: 'Password',
				createdAt: Date.now(),
			},
		}).should.be.deep.equal({
			user: 'User',
			password: this.CENSOR,
		});
	}

	@test
	'should reduce arrays'() {
		const arr = [
			{
				user: 'bruh',
			},
		];
		this.SUT.reduceArrays = true;
		this.SUT.censor(arr).should.be.equal(`Array[1]`);
		this.SUT2.censor(arr).should.be.equal('ARR[1]');
	}
}
