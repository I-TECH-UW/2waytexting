const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-like'));
chai.use(require('chai-things'));

const TestHarness = require('medic-conf-test-harness');
const harness = new TestHarness({ subject: 'health_center_id' });
const { enroll } = require('../form-inputs');

describe('Enrollment', () => {
  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    await harness.clear();
    harness.setNow('2000-01-01');
  });
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('Patient contact is created upon enrollment', async () => {
    const enrollment = await harness.fillForm('enroll', ...enroll.texting);
    expect(enrollment.errors).to.be.empty;
    expect(harness.options.docs).to.contain.something.like({
      type: 'person',
      role: 'patient',
      name: 'Client A',
      vmmc_no: 'WM0001',
      study_no: '0001',
      n_study: '',
      consent: 'yes',
      randomization: 'texting',
      phone: '+27000000000',
      confirm: '',
      language_preference: 'english',
      mobile_company: 'mtn',
      transport_cost: '0',
      clinic_trip: {
        hours: '0',
        minutes: '0'
      },
      food_cost: '0',
      wage_period: 'none',
      reported_date: 946677600000
    });
  });
});
