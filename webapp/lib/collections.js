// https://github.com/aldeed/meteor-collection2#autovalue
function dateCreatedAutoValue () {
  if (this.isInsert) {
    return new Date();
  } else if (this.isUpsert) {
    return { $setOnInsert: new Date() };
  } else {
    this.unset();  // Prevent user from supplying their own value
  }
}

Jobs = new Meteor.Collection("jobs");
Jobs.attachSchema(new SimpleSchema({
  kinases: { type: [String], label: "Activated Kinases", optional: true },
  mutations: { type: [String], label: "Mutated Genes", optional: true },
  amps: { type: [String], label: "Copy Number Amplifications", optional: true },
  dels: { type: [String], label: "Copy Number Deletions", optional: true },
  tfs: {
    type: [String],
    label: "Activated or Repressed Transcription Factors"
  },

  scaffoldNetwork: {
    type: String,
    label: "Select scaffold network for patient subtype",
    allowedValues: [
      "Drake Paull et al 2016",
    ],
  },

  dateCreated: { type: Date, autoValue: dateCreatedAutoValue },

  status: {
    type: String,
    defaultValue: "running",
    allowedValues: [
      "running",
      "done",
      "error",
    ],
  },
  // set to "Server restarted if we restart while it's running"
  errorDescription: { type: String, optional: true },

  result: {
    type: new SimpleSchema({
      hallmarksBlobId: { type: String },
      networkBlobId: { type: String },
      // the file could be blank ==> no network
      networkString: { type: String, optional: true },
      nodeData: { type: String },
    }),
    optional: true,
  },
}));

Jobs.allow({
  insert: function () {
    return true;
  },
});



BlobStore = new FS.Store.GridFS("blobs");

Blobs = new FS.Collection("blobs", {
  stores: [BlobStore],
});

// users can download a blob if they know the _id
Blobs.allow({
  download: function (userId, doc) {
    return true;
  }
});
