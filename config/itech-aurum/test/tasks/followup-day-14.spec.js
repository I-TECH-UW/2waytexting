const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const TestHarness = require('medic-conf-test-harness');
const tasks = require('../../tasks');
const harness = new TestHarness();

const { client_visit } = require('../form-inputs');

xdescribe('Followup Day 14 Task', () => {
  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    await harness.clear();
    harness.setNow('2000-01-01');
  });
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('Followup Day 14 task should not show until Day 11', async () => {
    let tasks = await harness.getTasks({ title: 'task.followup-day-14.title' });
    expect(tasks).to.be.empty;
    harness.flush(11);
    tasks = await harness.getTasks({ title: 'task.followup-day-14.title' });
    expect(tasks).to.be.empty;
  });

  it('Followup Day 14 task should start showing up from Day 12', async () => {
    harness.flush(12);
    const tasks = await harness.getTasks({ title: 'task.followup-day-14.title' });
    expect(tasks).to.have.property('length', 1);
  });

  it('Followup Day 14 task should only show up until Day 14 + 365', async () => {
    harness.flush(14 + 30);
    let tasks = await harness.getTasks({ title: 'task.followup-day-14.title' });
    expect(tasks).to.have.property('length', 1);
    harness.flush(1);
    tasks = await harness.getTasks({ title: 'task.followup-day-14.title' });
    expect(tasks).to.be.empty;
  });

  xit('Followup Day 14 task should resolve if client_visit of day 14 has been reported', async () => {
    harness.flush(15);
    const [followupDay14Task] = await harness.getTasks({ title: 'task.followup-day-14.title' });
    const formFilled = await harness.loadAction(followupDay14Task, ...client_visit.day14)
    expect(formFilled.errors).to.be.empty;
    tasks = await harness.getTasks({ title: 'task.followup-day-14.title' });
    console.log(tasks)
    expect(tasks).to.be.empty;
  });

  xit('Followup Day 14 task should not resolve if client_visit of day 7 has been reported', async () => {
    harness.flush(15);
    let [followupDay14Task] = await harness.getTasks({ title: 'task.followup-day-14.title' });
    const formFilled = await harness.loadAction(followupDay14Task, ...client_visit.day7)
    expect(formFilled.errors).to.be.empty;
    tasks = await harness.getTasks({ title: 'task.followup-day-14.title' });
    expect(tasks).to.have.property('length', 1);
  });
});