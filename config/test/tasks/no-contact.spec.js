const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const TestHarness = require('medic-conf-test-harness');
const tasks = require('../../tasks');
const harness = new TestHarness();
const { enroll, suspected_ae_reported } = require('../reports');
const { no_contact } = require('../form-inputs');

xdescribe('No contact task', () => {
  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    await harness.clear();
    harness.setNow('2000-01-01');
    harness.pushMockedDoc(enroll);
  });
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('Day 8 No-contact task should not show until day 7', async () => {
    let tasks = await harness.getTasks({ title: 'task.day8-no-contact.title' });
    expect(tasks).to.be.empty;
    harness.flush(7);
    tasks = await harness.getTasks({ title: 'task.day8-no-contact.title' });
    expect(tasks).to.be.empty;

  });

  it('Day 8 No-contact task should show on day 8', async () => {
    harness.flush(8);
    const tasks = await harness.getTasks({ title: 'task.day8-no-contact.title' });
    expect(tasks).to.have.property('length', 1);
  });

  it('Day 8 No-contact task should not show on day 8 if there is a report already', async () => {
    harness.flush(4);
    harness.pushMockedDoc(suspected_ae_reported);
    harness.flush(4);
    const tasks = await harness.getTasks({ title: 'task.day8-no-contact.title' });
    expect(tasks).to.be.empty;
  });

  it('Day 8 No-contact task should resolve after completing the action', async () => {
    harness.flush(8);
    const [noContactTask] = await harness.getTasks({ title: 'task.day8-no-contact.title' });
    const formFilled = await harness.loadAction(noContactTask, ...no_contact.ok);
    expect(formFilled.errors).to.be.empty;

    const tasks = await harness.getTasks({ title: 'task.day8-no-contact.title' });
    expect(tasks).to.be.empty;
  });

  it('Day 14 No-contact task should not show until day 13', async () => {
    let tasks = await harness.getTasks({ title: 'task.day14-no-contact.title' });
    expect(tasks).to.be.empty;
    harness.flush(13);
    tasks = await harness.getTasks({ title: 'task.day14-no-contact.title' });
    expect(tasks).to.be.empty;

  });

  it('Day 14 No-contact task should show on day 14', async () => {
    harness.flush(14);
    const tasks = await harness.getTasks({ title: 'task.day14-no-contact.title' });
    expect(tasks).to.have.property('length', 1);
  });

  it('Day 14 No-contact task should not show on day 14 if there is a report already', async () => {
    await harness.flush(4);
    harness.pushMockedDoc(suspected_ae_reported);
    await harness.flush(10);
    const tasks = await harness.getTasks({ title: 'task.day14-no-contact.title' });
    expect(tasks).to.be.empty;
  });

  it('Day 14 No-contact task should resolve after completing the action', async () => {
    harness.flush(14);
    let [noContactTask] = await harness.getTasks({ title: 'task.day14-no-contact.title' });
    const formFilled = await harness.loadAction(noContactTask, ...no_contact.ok);
    expect(formFilled.errors).to.be.empty;
    const tasks = await harness.getTasks({ title: 'task.day14-no-contact.title' });
    expect(tasks).to.be.empty;
  });
});