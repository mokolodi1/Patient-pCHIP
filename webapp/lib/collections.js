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
  upstreamProteins: { type: [String] },
  downstreamProteins: { type: [String] },

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
  error_description: { type: String, optional: true },

  result: {
    type: new SimpleSchema({
      hallmarksBlobId: { type: String },
      networkBlobId: { type: String },
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
