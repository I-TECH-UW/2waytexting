const { expect } = require('chai');
const TestHarness = require('medic-conf-test-harness');
//const harness = new TestHarness({ headless: false })
const harness = new TestHarness();
const { site, patient } = require('../contacts');
const { enroll } = require('../form-inputs');

describe('Enrollment', () => {
    before(async () => { return await harness.start(); });
    after(async () => { return await harness.stop(); });
    beforeEach(async () => {
        await harness.clear();
        harness.setNow("2000-01-01 00:00");
        harness.state.contacts.push(site);
        harness.content.contact = site;
    });
    afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

    it('Patient contact is created upon enrollment', async () => {
        const enrollment = await harness.fillForm('enroll', ...enroll.texting);
        expect(enrollment.errors).to.be.empty;
        harness.state.contacts[1]._id = 'patient_id';
        expect(harness.state.contacts[1]).to.deep.equal(patient);
    });

});
