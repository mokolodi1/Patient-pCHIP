Meteor.publish("job", function (jobId) {
  check(jobId, String);
  return Jobs.find(jobId);
});
