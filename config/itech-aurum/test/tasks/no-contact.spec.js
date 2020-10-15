const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const TestHarness = require('medic-conf-test-harness');
const tasks = require('../../tasks');
const {super_nurse_user} = require('../users');
//const harness = new TestHarness({ headless: false, user: super_nurse_user })
const harness = new TestHarness({ user: super_nurse_user});
const { patient, site } = require('../contacts');
const { enroll, suspected_ae_reported } = require('../reports');
const {potential_ae, referral_confirmation, no_contact } = require('../form-inputs');

describe('No contact task', () => {
    before(async () => { return await harness.start(); });
    after(async () => { return await harness.stop(); });
    beforeEach(async () => {
        await harness.clear();
        harness.setNow("2000-01-01 00:00");
        harness.state.contacts.push(site, patient);
        harness.content.contact = patient;
        harness.state.reports.push(enroll);
    });
    afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

    it('No-contact task should not show until day 7', async () => {
        let tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.no-contact.title' });
        harness.flush(7);
        tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.no-contact.title' });

    });

    it('No-contact task should show on day 8', async () => {
        harness.flush(8);
        const tasks = await harness.getTasks();
        expect(tasks).to.contain.something.like({ title: 'task.no-contact.title' });
    });

    it('No-contact task should not show on day 8 if there is a report already', async () => {
        harness.flush(4);
        harness.state.reports.push(suspected_ae_reported);
        harness.flush(4);
        const tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.no-contact.title' });
    });

    it('No-contact task should resolve after completing the action', async () => {
        harness.flush(8);
        let tasks = await harness.getTasks();
        expect(tasks).to.contain.something.like({ title: 'task.no-contact.title' });
        const noContactTask = tasks.find(t => t.title === 'task.no-contact.title');
        await harness.loadAction(noContactTask.actions[0]);
        const formFilled = await harness.fillForm(...no_contact.ok);
        expect(formFilled.errors).to.be.empty;
        tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.no-contact.title' });

    });
});