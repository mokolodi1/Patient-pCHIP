// add a hook for the create job form
AutoForm.hooks({
  "create-job": {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      Meteor.call("runJob", insertDoc, (error, jobId) => {
        FlowRouter.go("showResult", { jobId });

        // done with the submission of the form
        this.done();
      });

      return false;
    }
  }
});

Template.create.helpers({
  Jobs: Jobs,
});

// Template.showResult

Template.showResult.onCreated(function () {
  let instance = this;

  instance.subscribe("job", instance.data);

  // subscribe to the blobs if the job is done
  instance.autorun(function () {
    var job = Jobs.findOne(instance.data);

    if (job && job.status === "done") {
      instance.subscribe("blob", job.result.hallmarksBlobId);
      instance.subscribe("blob", job.result.networkBlobId);
    }
  });
});

Template.showResult.helpers({
  getJob: function () {
    return Jobs.findOne(Template.instance().data);
  },
});

// Template.listGenes

Template.listGenes.onRendered(function () {
  let instance = this;

  instance.$('[data-toggle="tooltip"]').tooltip();
});

// Template.rememberThisUrl

Session.setDefault("remindToSaveUrl", true);

Template.rememberThisUrl.onRendered(function () {
  let instance = this;

  instance.$('[data-toggle="tooltip"]').tooltip();
});

Template.rememberThisUrl.helpers({
  remindToSaveUrl: function () {
    return Session.get("remindToSaveUrl");
  },
});

Template.rememberThisUrl.events({
  "click #dismissRemindSaveUrl": function (event, instance) {
    Session.set("remindToSaveUrl", false);
  },
});
