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
});

Template.showResult.helpers({
  getJob: function () {
    return Jobs.findOne(Template.instance().data);
  },
});
