Meteor.publish("job", function (jobId) {
  check(jobId, String);
  return Jobs.find(jobId);
});

Meteor.publish("blob", function (blobId) {
  check(blobId, String);
  return Blobs.find(blobId);
});
