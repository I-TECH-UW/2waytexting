const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const TestHarness = require('medic-conf-test-harness');

const harness = new TestHarness();
const { potential_ae, referral_confirmation } = require('../form-inputs');

describe('AE referral task', () => {
  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    await harness.clear();
    harness.setNow('2000-01-01 00:00');
  });
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('AE referral task should not show until potential AE report is submitted', async () => {
    const tasks = await harness.getTasks({ title: 'task.ae-referral.title' });
    expect(tasks).to.have.property('length', 0);
  });

  it('AE referral task should start to show immediately after potential AE report is submitted where client is asked to return to the clinic', async () => {
    harness.flush(5);
    const formFilled = await harness.fillForm('potential_ae', ...potential_ae.day5_pain_called);
    expect(formFilled.errors).to.be.empty;

    const tasks = await harness.getTasks({ title: 'task.ae-referral.title' });
    expect(tasks).to.have.property('length', 1);
  });

  it('AE referral task should not show after potential AE report is submitted where client is not asked to return to the clinic', async () => {
    harness.flush(5);
    const formFilled = await harness.fillForm('potential_ae', ...potential_ae.day5_pain_not_called);
    expect(formFilled.errors).to.be.empty;
    const tasks = await harness.getTasks({ title: 'task.ae-referral.title' });
    expect(tasks).to.have.property('length', 0);
  });

  it('AE Referral task should only show up until Day 2 + 365 after the report', async () => {
    const formFilled = await harness.fillForm('potential_ae', ...potential_ae.day5_pain_called);
    expect(formFilled.errors).to.be.empty;
    let tasks = await harness.getTasks({ title: 'task.ae-referral.title' });
    expect(tasks).to.have.property('length', 1);
    harness.flush(367);
    tasks = await harness.getTasks({ title: 'task.ae-referral.title' });
    expect(tasks).to.have.property('length', 1);
    harness.flush(1);
    tasks = await harness.getTasks({ title: 'task.ae-referral.title' });
    expect(tasks).to.have.property('length', 0);
  });

  it('AE Referral task should resolve after referral_confirmation is done', async () => {
    harness.flush(5);
    let formFilled = await harness.fillForm('potential_ae', ...potential_ae.day5_pain_called);
    expect(formFilled.errors).to.be.empty;
    harness.flush(1);

    const [aeReferralTask] = await harness.getTasks({ title: 'task.ae-referral.title' });
    formFilled = await harness.loadAction(aeReferralTask, ...referral_confirmation.returned)
    expect(formFilled.errors).to.be.empty;

    const tasks = await harness.getTasks({ title: 'task.ae-referral.title' });
    expect(tasks).to.have.property('length', 0);
  });
});