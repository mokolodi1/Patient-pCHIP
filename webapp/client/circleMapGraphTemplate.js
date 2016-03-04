/**
 * for use with circleMapHallmarksModeTemplate
 */
function drawCircleMapGraph(sifString, sampleData, centerScores) {
    console.log("BEGIN drawCircleMapGraph_hallmarksMode");
    console.log("sifString", sifString);
    console.log("sampleData", sampleData);
    console.log("centerScores", centerScores);

    var containerDiv = document.getElementById("render-circle-map-here");
    circleMapGraph.build({
        "sifGraphData" : sifString,
        "hallmarksModeSampleData" : sampleData,
        "centerScores" : centerScores,
        "containerDiv" : containerDiv,
        "circleDataLoaded" : true
    });

    console.log("END drawCircleMapGraph_hallmarksMode");
};

Template.circleMapGraphTemplate.rendered = function() {
    const instance = this;

    instance.autorun(function(first) {
        // get graph data (sif in a string)
        var sifString = Session.get("sifString");// || "A	-PPI>	B\nC	-PPI>	D\nA	-PPI>	E\nA	-kinase_regulator>	F";
        console.log("sifString:", sifString);

        // get sample data (TSV in a string, with columns: Gene, Kinases, Mutations, Amps, Dels, TFs)
        var sampleData = Session.get("hallmarksSampleData");// || "Gene	Kinases	Mutations	Amps	Dels	TFs\nA	1	1	0	0	0	0\nB	0	1	0	0	0	0\nC	0	1	0	0	0	0\nD	0	1	0	0	0	0\nE	0	1	0	0	0	0\nF	0	0	0	0	0	0";

        // get node center scores
        var centerScores = {};
        if (!_.isUndefined(sampleData)) {
            var parsedSampleData = d3.tsv.parse(sampleData);
            _.each(parsedSampleData, function(obj) {
                centerScores[obj["Gene"]] = obj["Kinases"];
            });
        }

        drawCircleMapGraph(sifString, sampleData, centerScores);
        first.stop();
    });
};
