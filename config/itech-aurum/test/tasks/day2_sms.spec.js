const { expect } = require('chai');
const TestHarness = require('medic-conf-test-harness');
const tasks = require('../../tasks');
const {super_nurse_user} = require('../users');
//const harness = new TestHarness({ headless: false, user: super_nurse_user })
const harness = new TestHarness({ user: super_nurse_user});
const { patient } = require('../contacts');
const {day2_sms } = require('../form-inputs');

describe('Day 2 SMS Task', () => {
    before(async () => { return await harness.start(); });
    after(async () => { return await harness.stop(); });
    beforeEach(async () => {
        await harness.clear();
        harness.setNow("2000-01-01 00:00");
        harness.state.contacts.push(patient);
        harness.content.contact = patient;
    });
    afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

    it('Day 2 SMS Received task should not show until Day 1', async () => {
        let tasks = await harness.getTasks();
        expect(tasks).to.be.empty;
        harness.flush(1);
        tasks = await harness.getTasks();
        expect(tasks).to.be.empty;
    });

    it('Day 2 SMS Received task should show on Day 2', async () => {
        let tasks = await harness.getTasks();
        expect(tasks).to.be.empty;
        harness.flush(2);
        tasks = await harness.getTasks();
        expect(tasks).to.have.property('length', 1);
        expect(tasks[0]).to.include({ title: 'task.day2-sms.title' });
        expect(tasks[0].contact).to.include({name: 'Client A'});
    });

    it('Day 2 SMS Received task should show until Day 365+2 only', async () => {
        let tasks = await harness.getTasks();
        expect(tasks).to.be.empty;
        harness.flush(367);
        tasks = await harness.getTasks();
        expect(tasks).to.have.property('length', 3);
        expect(tasks[0]).to.include({ title: 'task.day2-sms.title' });
        expect(tasks[0].contact).to.include({name: 'Client A'});
        harness.flush(1);
        tasks = await harness.getTasks();
        expect(tasks).to.have.property('length', 2);
    });

    it('Day 2 SMS Received task should not show if resolved', async () => {
        harness.flush(2);
        let tasks = await harness.getTasks();
        expect(tasks).to.have.length(1);
        harness.loadAction(tasks[0].actions[0]);
        let formFilled = await harness.fillForm(...day2_sms.yes_no_ae)
        expect(formFilled.errors).to.be.empty;
        tasks = await harness.getTasks();
        expect(tasks).to.be.empty;
        });
});
