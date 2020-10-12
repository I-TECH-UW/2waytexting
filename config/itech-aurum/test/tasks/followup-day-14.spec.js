const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const TestHarness = require('medic-conf-test-harness');
const tasks = require('../../tasks');
const {super_nurse_user} = require('../users');
//const harness = new TestHarness({ headless: false, user: super_nurse_user })
const harness = new TestHarness({ user: super_nurse_user});
const { patient } = require('../contacts');
const {client_visit } = require('../form-inputs');

describe('Followup Day 14 Task', () => {
    before(async () => { return await harness.start(); });
    after(async () => { return await harness.stop(); });
    beforeEach(async () => {
        await harness.clear();
        harness.setNow("2000-01-01 00:00");
        harness.state.contacts.push(patient);
        harness.content.contact = patient;
    });
    afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

    it('Followup Day 14 task should not show until Day 11', async () => {
        let tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.followup-day-14.title' });
        harness.flush(11);
        tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.followup-day-14.title' });
    });

    it('Followup Day 14 task should start showing up from Day 12', async () => {
        harness.flush(12);
        let tasks = await harness.getTasks();
        expect(tasks).to.contain.something.like({ title: 'task.followup-day-14.title' });
    });

    it('Followup Day 14 task should only show up until Day 14 + 365', async () => {
        harness.flush(14 + 365);
        let tasks = await harness.getTasks();
        expect(tasks).to.contain.something.like({ title: 'task.followup-day-14.title' });
        harness.flush(1);
        tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.followup-day-14.title' });
    });

    it('Followup Day 14 task should resolve if client_visit of day 14 has been reported', async () => {
        harness.flush(15);
        let tasks = await harness.getTasks();
        let followupDay14Task = tasks.find(t => t.title === 'task.followup-day-14.title');
        harness.loadAction(followupDay14Task.actions[0]);
        let formFilled = await harness.fillForm(...client_visit.day14)
        expect(formFilled.errors).to.be.empty;
        tasks = await harness.getTasks();
        expect(tasks).to.not.contain.something.like({ title: 'task.followup-day-14.title' });
    });

    it('Followup Day 14 task should not resolve if client_visit of day 7 has been reported', async () => {
        harness.flush(15);
        let tasks = await harness.getTasks();
        let followupDay14Task = tasks.find(t => t.title === 'task.followup-day-14.title');
        harness.loadAction(followupDay14Task.actions[0]);
        let formFilled = await harness.fillForm(...client_visit.day7)
        expect(formFilled.errors).to.be.empty;
        tasks = await harness.getTasks();
        expect(tasks).to.contain.something.like({ title: 'task.followup-day-14.title' });
    });
});