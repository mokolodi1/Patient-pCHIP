Q = Meteor.npmRequire('q');

Meteor.startup(function () {
  // Update the jobs that were running when the server restarted
  // to be status "error" and have a nice error message.
  console.log("updating");
  Jobs.update({
    status: "running",
  }, {
    $set: {
      status: "error",
      error_description: "Server restarted while running job",
    }
  });
});

// adapted from https://gist.github.com/Stuk/6226938
function spawnCommand (command, args, cwd) {
  console.log("command:", command);
  if (args && !args.every(function (arg) {
        var type = typeof arg;
        console.log("arg, type:", arg, type);
        return type === "boolean" || type === "string" || type === "number";
      })) {
    return Q.reject(new Error("All arguments must be a boolean, string or number"));
  }

  var deferred = Q.defer();

  // // TODO: what happens to stdout/stderr?
  // var stdoutPath = path.join(cwd, "./stdout.log");
  // var stdout = fs.openSync(stdoutPath, "a");
  // var stderrPath = path.join(cwd, "./stderr.log");
  // var stderr = fs.openSync(stderrPath, "a");
  var proc = spawn(command, args, {
    cwd: cwd,
    // stdio: ["ignore", stdout, stderr]
  });

  proc.on("error", deferred.reject);
  proc.on("exit", deferred.resolve);

  return deferred.promise;
};

Meteor.methods({
  runJob: function (formValues) {
    // TODO: figure out why the .pick method isn't working
    // Jobs.simpleSchema().pick(["firstList", "secondList"]);
    check(formValues, new SimpleSchema({
      firstList: { type: [String] },
      secondList: { type: [String] },
    }));

    // insert into the jobs collection
    var jobId = Jobs.insert(formValues);

    // If for some reason we run into some problem while running the job,
    // update the job with a nice error message.
    function internalError (error) {
      console.log("error on jobId:", jobId);
      console.log("error:", error);
      console.log("error.stack:", error.stack);

      // Write the internal error to the job using mongo instead of Meteor
      // because we don't know if we'll have the Meteor environment.
      Jobs.rawCollection().update({_id: jobId}, {
        $set: {
          status: "error",
          error_description: "Internal error",
        }
      }, function (error, result) {
        if (error) {
          console.log("Error updating job with error status, description.");
          console.log("error:", error);
          console.log("error.stack:", error.stack);
        } else {
          console.log("Updated job with error status and description");
        }
      });
    }

    // run the python code and update the job when we're done
    Q.delay(5000)
      .then(Meteor.bindEnvironment(function () {
        Jobs.update(jobId, {
          $set: {
            status: "done",
          }
        });

        spawn("python", ["script.py", ])
      }, internalError))
      .catch(internalError);

    // return the job _id so the client can go to the right URL
    return jobId;
  },
});
