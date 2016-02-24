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
  firstList: { type: [String] },
  secondList: { type: [String] },

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
    type: String,
    optional: true,
  },
}));

Jobs.allow({
  insert: function () {
    return true;
  },
});
