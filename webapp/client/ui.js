// Template.create

Session.setDefault("upstreamGenesError", false);

// add a hook for the create job form
AutoForm.hooks({
  "create-job": {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      // make sure that there are at least some upstream proteins

      const hasUpstream = _.some([
        insertDoc.kinases,
        insertDoc.mutations,
        insertDoc.amps,
        insertDoc.dels,
      ], function (value) {
        return !!value;
      });

      if (!hasUpstream) {
        Session.set("upstreamGenesError", true);
        this.done(new Error("noUpstreamProteins"));
      } else {
        Session.set("upstreamGenesError", false);
        Meteor.call("runJob", insertDoc, (error, jobId) => {
          if (error) {
            alert(`There was an internal error creating your job.
Please contact Teo Fleming at mokolodi1@gmail.com.`);
          } else {
            FlowRouter.go("showResult", { jobId });
          }

          // done with the submission of the form
          this.done();
        });
      }

      return false; // equivalent to event.preventDefault()
    }
  },
});

Template.create.helpers({
  Jobs: Jobs,
});

Template.create.events({
  "input .upstreamGeneInput": function (event, instance) {
    Session.set("upstreamGenesError", false);
  },
});



// Template.showResult

Template.showResult.onCreated(function () {
  let instance = this;

  instance.subscribe("job", instance.data);

  // subscribe to the blobs if the job is done
  instance.autorun(function () {
    var job = Jobs.findOne(instance.data);

    if (job && job.result && job.result.networkString) {
      Session.set("sifString", job.result.networkString);
    }

    if (job && job.result && job.result.nodeData) {
      Session.set("hallmarksSampleData", job.result.nodeData);
    }

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



// Template.jobDoneResult

Template.jobDoneResult.helpers({
  networkBlobUrl: function () {
    if (this && this.result && this.result.networkBlobId) {
      const blob = Blobs.findOne(this.result.networkBlobId);
      if (blob) {
        return blob.url();
      }
    }
  },
});



// Template.listGenes

// Template.listGenes.onRendered(function () {
//   let instance = this;
//
//   instance.$('[data-toggle="tooltip"]').tooltip();
// });



// Template.rememberThisUrl

Session.setDefault("remindToSaveUrl", true);

Template.rememberThisUrl.onRendered(function () {
  let instance = this;

  instance.$('[data-toggle="tooltip"]').tooltip();
});

Template.rememberThisUrl.events({
  "click #dismissRemindSaveUrl": function (event, instance) {
    Session.set("remindToSaveUrl", false);
  },
});
