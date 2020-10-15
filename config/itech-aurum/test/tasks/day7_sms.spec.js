const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const TestHarness = require('medic-conf-test-harness');
const tasks = require('../../tasks');
const {super_nurse_user} = require('../users');
//const harness = new TestHarness({ headless: false, user: super_nurse_user })
const harness = new TestHarness({ user: super_nurse_user});
const { super_nurse, patient } = require('../contacts');
const {day7_sms } = require('../form-inputs');

describe('Day 7 SMS Task', () => {
    before(async () => { return await harness.start(); });
    after(async () => { return await harness.stop(); });
    beforeEach(async () => {
        await harness.clear();
        harness.setNow("2000-01-01 00:00");
        harness.state.contacts.push(patient);
        harness.content.contact = patient;
    });
    afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

    it('Day 7 SMS Received task should not show until Day 6', async () => {
        let tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.day7-sms.title' });
        harness.flush(6);
        tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.day7-sms.title' });
    });

    it('Day 7 SMS Received task should show on Day 7', async () => {
        harness.flush(7);
        const tasks = await harness.getTasks();
        expect(tasks).to.contain.something.like({ title: 'task.day7-sms.title' });
        expect(tasks[0].contact).to.include({name: 'Client A'});
    });

    it('Day 7 SMS Received task should show until Day 365+7 only', async () => {
        harness.flush(372);
        let tasks = await harness.getTasks();
        expect(tasks).to.contain.something.like({ title: 'task.day7-sms.title' });
        harness.flush(1);
        tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.day7-sms.title' });
    });

    it('Day 7 SMS Received task should not show if resolved', async () => {
        harness.flush(7);
        let tasks = await harness.getTasks();
        expect(tasks).to.contain.something.like({ title: 'task.day7-sms.title' });
        const day7SMSTask = tasks.find(t => t.title === 'task.day7-sms.title');
        harness.loadAction(day7SMSTask.actions[0]);
        const formFilled = await harness.fillForm(...day7_sms.yes_no_ae)
        expect(formFilled.errors).to.be.empty;
        tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.day7-sms.title' });
        });
});
