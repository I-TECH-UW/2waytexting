const { expect } = require('chai');
const TestHarness = require('medic-conf-test-harness');
const tasks = require('../../tasks');
const harness = new TestHarness();
const { sms_followup } = require('../form-inputs');

xdescribe('Day 2 SMS Task', () => {
  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    await harness.clear();
    harness.setNow("2000-01-01");
  });
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('Day 2 SMS Received task should not show until Day 1', async () => {
    let tasks = await harness.getTasks();
    expect(tasks).to.be.empty;
    harness.flush(1);
    tasks = await harness.getTasks();
    expect(tasks).to.be.empty; // TODO: Bug?
  });

  it('Day 2 SMS Received task should show on Day 2', async () => {
    let tasks = await harness.getTasks();
    expect(tasks).to.be.empty;
    harness.flush(2);
    tasks = await harness.getTasks({ title: 'task.day2-sms.title' });
    expect(tasks).to.have.property('length', 1);
    expect(tasks[0].emission.contact).to.include({ name: 'Client A' });
  });

  it('Day 2 SMS Received task should show until Day 30+2 only', async () => {
    let tasks = await harness.getTasks();
    expect(tasks).to.be.empty;
    harness.flush(32);
    tasks = await harness.getTasks({ title: 'task.day2-sms.title' });
    expect(tasks).to.have.property('length', 1);
    expect(tasks[0].emission.contact).to.include({ name: 'Client A' });
    harness.flush(1);
    tasks = await harness.getTasks();
    expect(tasks).to.have.property('length', 2);
  });

  it('Day 2 SMS Received task should not show if resolved', async () => {
    harness.flush(2);
    let tasks = await harness.getTasks();
    expect(tasks).to.have.length(1);
    const formFilled = await harness.loadAction(tasks[0], ...sms_followup)
    expect(formFilled.errors).to.be.empty;
    tasks = await harness.getTasks();
    expect(tasks).to.be.empty;
  });
});
