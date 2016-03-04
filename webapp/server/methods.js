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
    // TODO: figure out why the .pick method isn't working
    // ;
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
    ]));

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

    // first wrangle the inputs
    let kinases = wrangleGenes(formValues.kinases);
    let mutations = wrangleGenes(formValues.mutations);
    let amps = wrangleGenes(formValues.amps);
    let dels = wrangleGenes(formValues.dels);
    let tfs = wrangleGenes(formValues.tfs);

    // then set them for the job
    Jobs.update(jobId, {
      $set: { kinases, mutations, amps, dels, tfs }
    });

    // then join with colons
    kinases = joinIfNotBlank(kinases);
    mutations = joinIfNotBlank(mutations);
    amps = joinIfNotBlank(amps);
    dels = joinIfNotBlank(dels);
    tfs = joinIfNotBlank(tfs);

    let notBlank = _.filter([kinases, mutations, amps, dels], (value) => {
      return !!value; // not falsey
    });
    let upstreamProteins = notBlank.join(":");

    // run the python code and update the job when we're done
    let workDir = ntemp.mkdirSync("pCHIP");
    console.log("workDir:", workDir);

    console.log("spawning...");
    spawnCommand(Meteor.settings.mapPatient, [
      upstreamProteins,
      tfs,
      workDir,
      Meteor.settings.scaffold,
      Meteor.settings.gene_universe,
      kinases,
      mutations,
      amps,
      dels
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
