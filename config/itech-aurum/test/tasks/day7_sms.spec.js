const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const TestHarness = require('medic-conf-test-harness');
const tasks = require('../../tasks');

const harness = new TestHarness({ user: 'super_nurse_uuid' });
const { sms_followup } = require('../form-inputs');

describe('Day 7 SMS Task', () => {
  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    await harness.clear();
    harness.setNow('2000-01-01');
  });
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('Day 7 SMS Received task should not show until Day 6', async () => {
    let tasks = await harness.getTasks({ title: 'task.day7-sms.title' });
    expect(tasks).to.be.empty;
    harness.flush(6);
    tasks = await harness.getTasks({ title: 'task.day7-sms.title' });
    expect(tasks).to.be.empty;
  });

  it('Day 7 SMS Received task should show on Day 7', async () => {
    harness.flush(7);
    const tasks = await harness.getTasks({ title: 'task.day7-sms.title' });
    expect(tasks).to.have.property('length', 1);
    expect(tasks[0].emission.contact).to.include({ name: 'Client A' });
  });

  xit('Day 7 SMS Received task should show until Day 30 only', async () => {
    harness.flush(30);
    let tasks = await harness.getTasks({ title: 'task.day7-sms.title' });
    expect(tasks).to.have.property('length', 1);
    harness.flush(1);
    tasks = await harness.getTasks({ title: 'task.day7-sms.title' });
    expect(tasks).to.be.empty;
  });

  it('Day 7 SMS Received task should not show if resolved', async () => {
    harness.flush(7);
    const [day7SMSTask] = await harness.getTasks({ title: 'task.day7-sms.title' });
    const formFilled = await harness.loadAction(day7SMSTask, ...sms_followup)
    expect(formFilled.errors).to.be.empty;
    const tasks = await harness.getTasks({ title: 'task.day7-sms.title' });
    expect(tasks).to.be.empty;
  });
});
