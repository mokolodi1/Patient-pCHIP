#!/bin/bash

BASEDIR="$(dirname $0)"

upstream_nodes=$1
downstream_nodes=$2
output=$3
scaffold=$4
gene_universe=$5

echo "about to start mapPatient"

mkdir -p $output
# map patient data to get a network from the scaffold
$BASEDIR/mapPatient.py \
	--scaffold $scaffold \
	$upstream_nodes \
	$downstream_nodes \
	> $output/patient-network.sif

echo "done with mapPatient.py"

# get network nodes
cut -f 1 $output/patient-network.sif > /tmp/1.tmp
cut -f 3 $output/patient-network.sif >> /tmp/1.tmp
sort -u /tmp/1.tmp > $output/patient-network.lst
rm -f /tmp/1.tmp

# take the input network, generate a list of nodes in the right format for the next step,
# and generate subnetworks corresponding to each hallmark of cancer
$BASEDIR/bin/subnetworkZoom --network $output/patient-network.sif \
	--hallmarks $BASEDIR/GSEA_SETS/hallmarks.small \
	-e $BASEDIR/undirected_edge_types.txt \
	--output $output

# do enrichment anlysis
export MYPERLDIR=${BASEDIR}/PERL-TOOLS/perl

# convert to tab format for sets_overlap.pl
$BASEDIR/PERL-TOOLS/perl/transpose.pl $output/patient-network.lst | sed -e 's/^/TieDIE	/' > $output/network_nodes.txt

# run enrichment test
$BASEDIR/PERL-TOOLS/perl/sets_overlap.pl $BASEDIR/GSEA_SETS/hallmarks.small \
	$output/network_nodes.txt \
	-U ${gene_universe} -p 1 \
	> $output/enrichment.txt

# generate the hallmark wheel itself
$BASEDIR/plot-wheel.bash $output/enrichment.txt \
	$BASEDIR/GSEA_SETS/colors.default.txt \
	$output
