FlowRouter.route("/", {
  name: "create",
  action: function() {
    BlazeLayout.render("appBody", {content: "create"});
  }
});

FlowRouter.route("/result/:jobId", {
  name: "showResult",
  action: function(params) {
    console.log("params:", params);
    BlazeLayout.render("appBody", {
      content: "showResult",
      jobId: params.jobId,
    });
  }
});

FlowRouter.notFound = {
  action: function () {
    BlazeLayout.render("appBody", {content: "pageNotFound"});
  }
};
