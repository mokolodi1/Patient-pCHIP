Q = Meteor.npmRequire('q');
ntemp = Meteor.npmRequire('temp').track();
spawn = Npm.require('child_process').spawn;
path = Npm.require('path');
fs = Npm.require('fs');

Meteor.startup(function () {
  // Update the jobs that were running when the server restarted
  // to be status "error" and have a nice error message.
  Jobs.update({
    status: "running",
  }, {
    $set: {
      status: "error",
      errorDescription: "Server restarted while running job",
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

  // TODO: what happens to stdout/stderr?
  var stdoutPath = path.join(cwd, "./stdout.log");
  var stdout = fs.openSync(stdoutPath, "a");
  var stderrPath = path.join(cwd, "./stderr.log");
  var stderr = fs.openSync(stderrPath, "a");
  var proc = spawn(command, args, {
    cwd: cwd,
    stdio: ["ignore", stdout, stderr]
  });

  proc.on("error", deferred.reject);
  proc.on("exit", deferred.resolve);

  return deferred.promise;
};

function wrangleGenes (arrayOfLines) {
  // NOTE: because we're using textareas on the client, the arrayOfLines
  // has been broken by line and

  if (arrayOfLines) {
    // "".split("sdf") ==> [""]
    const perhapsEmptyString = arrayOfLines.join("\n").split(/[\s,;|]+/);
    if (perhapsEmptyString[0] === "") {
      return [];
    }
    return perhapsEmptyString;
  }
  return [];
}

function joinIfNotBlank (arrayOfGenes) {
  if (arrayOfGenes) {
    return arrayOfGenes.join(":");
  }
  return "";
}

Meteor.methods({
  runJob: function (formValues) {
    console.log("\nrunJob");
    // TODO: figure out why the .pick method isn't working
    check(formValues, Jobs.simpleSchema().pick([
      "kinases",
      "kinases.$",
      "mutations",
      "mutations.$",
      "amps",
      "amps.$",
      "dels",
      "dels.$",
      "tfs",
      "tfs.$",
      "scaffoldNetwork",
    ]));

    const formArrayKeys = ["kinases", "mutations", "amps", "dels", "tfs"];

    // wrangle each of the genes into an array
    _.each(formValues, (value, key) => {
      if (formArrayKeys.indexOf(key) !== -1) {
        formValues[key] = wrangleGenes(value);
      } else { console.log("didn't wrangle", key); }
    });

    // make sure there's an upstream field that's not blank
    let notBlankUpstreamGenes = _.filter(formValues, (value, key) => {
      // reject if not an upstream gene field
      if (!formArrayKeys.indexOf(key) !== -1 && key !== "tfs") {
        return false;
      }

      return !!value; // not falsey
    });

    // if no upstream proteins, throw error
    if (!notBlankUpstreamGenes) {
      throw new Meteor.Error("noUpstreamProteins");
    }

    // insert into the jobs collection before joining with colons
    const jobId = Jobs.insert(formValues);



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
          errorDescription: "Internal error",
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
    let workDir = ntemp.mkdirSync("pCHIP");
    console.log("workDir:", workDir);

    console.log("spawning...");
    spawnCommand(Meteor.settings.mapPatient, [
      notBlankUpstreamGenes.join(":"),
      joinIfNotBlank(formValues.tfs),
      workDir,
      Meteor.settings.scaffold,
      Meteor.settings.gene_universe,
      joinIfNotBlank(formValues.kinases),
      joinIfNotBlank(formValues.mutations),
      joinIfNotBlank(formValues.amps),
      joinIfNotBlank(formValues.dels),
    ], workDir)
      .then(Meteor.bindEnvironment(function () {
        console.log("loading into blobs");
        let hallmarksBlob =
            Blobs.insert(path.join(workDir, "merged_images.png"));
        const networkPath = path.join(workDir, "patient-network.sif");
        let patientNetworkBlob =
            Blobs.insert(networkPath);

        // read in .sif network into a string
        let networkString = fs.readFileSync(networkPath, {encoding: 'utf8'});
        let nodeDataPath = path.join(workDir, "network.data.txt");
        let nodeData = fs.readFileSync(nodeDataPath, {encoding: 'utf8'});

        Jobs.update(jobId, {
          $set: {
            status: "done",
            result: {
              hallmarksBlobId: hallmarksBlob._id,
              networkBlobId: patientNetworkBlob._id,
              networkString,
              nodeData,
            },
          },
        });

        console.log("done");
      }, internalError))
      .catch(internalError);



    // return the job _id so the client can go to the right URL
    return jobId;
  },
});
