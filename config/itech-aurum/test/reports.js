module.exports = {
  enroll: {
    form: "enroll",
    type: "data_record",
    content_type: "xml",
    reported_date: 946677600000,
    _id: "enroll_id",
    fields: {
      inputs: {
        meta: {
          location: {
            lat: "",
            long: "",
            error: "",
            message: ""
          },
          deprecatedID: ""
        },
        source: "user",
        source_id: "",
        is_task: "",
        contact: {
          _id: "site_uuid",
          name: "Site A",
          phone: "",
          parent: {
            _id: "district_id"
          }
        }
      },
      patient_name: "Client A",
      patient_uuid: "patient_id",
      place_id: "site_uuid",
      phone: "+27000000000",
      language_preference: "english",
      randomization: "texting",
      meta: {
        instanceID: "uuid:671ee418-dad4-42d5-ac4b-ba7a765bbe10"
      }
    }
  },

  suspected_ae_reported: {
    _id: "report_1",
    type: "data_record",
    from: "+27000000000",
    form: "1",
    reported_date: "946944000000",
    contact: {
      _id: "patient_id",
      parent: {
        _id: "site_id",
        parent: {
          _id: "district_id"
        }
      }
    }
  }
}