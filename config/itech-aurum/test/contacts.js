module.exports = {
    site_nurse: {
        type: 'person',
        parent: {
            _id: 'site_id',
            parent: {
                _id: 'district_id',
            }
        },
        name: 'Site Nurse',
        role: 'site_nurse',
        phone: '+27345678901',
        alternate_phone: '+27345678901',
        reported_date: '2000-01-01',
        _id: 'site_nurse_uuid',
        patient_id: 'site_nurse_id',
        _rev: '1-a'
    },

    super_nurse: {
        type: 'person',
        parent: {
            _id: 'district_id',
        },
        name: 'Super Nurse',
        role: 'super_nurse',
        phone: '+27345678902',
        alternate_phone: '+27345678902',
        reported_date: '2000-01-01',
        _id: 'super_nurse_uuid',
        patient_id: 'super_nurse_uuid',
        _rev: '1-a'
    },
    site: {
        type: 'health_center',
        parent: {
            _id: 'district_id',
        },
        contact: {
            _id: 'site_nurse_uuid'
        },
        name: 'Site A',
        reported_date: '2000-01-01',
        _id: 'site_uuid',
        _rev: '1-a'
    },

    patient: {
        parent: {
            _id: "site_uuid",
            parent: {
                _id: "district_id"
            }
        },
        _id: "patient_id",
        type: "person",
        role: "patient",
        name: "Client A",
        vmmc_no: "WM0001",
        study_no: "0001",
        n_study: "",
        consent: "yes",
        randomization: "texting",
        phone: "+27000000000",
        confirm: "",
        language_preference: "english",
        mobile_company: "mtn",
        transport_cost: "0",
        clinic_trip: {
            hours: "0",
            minutes: "0"
        },
        food_cost: "0",
        wage_period: "none",
        reported_date: 946677600000
    }

};
