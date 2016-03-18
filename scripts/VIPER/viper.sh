#!/bin/bash

BASEDIR="$(dirname $0)"

sample_data="$1"
normal_data="$BASEDIR/pancan12.freeze4.6.tab"
regulon="extended_pathways_transcriptional.adj"

sample_name="`head -n 1 $sample_data | cut -f 2`"

export MYPERLDIR=${BASEDIR}/../PERL-TOOLS/perl

echo $sample_data
echo $sample_name
# add data and regulon to /tmp
mkdir -p tmp
$BASEDIR/../PERL-TOOLS/perl/join.pl $sample_data $normal_data > tmp/data.tab
cp $regulon tmp

# docker run 
mkdir -p output
docker run --rm \
	-v output:/output \
	-v tmp:/data \
	ucsc-viper-unsupervised \
	-e /data/data.tab \
	-n /data/$regulon \
	--output /output

result=/tmp/viperScores.txt
head -n 1 $result > /tmp/sample.txt
grep '^$sample_name' $result >> /tmp/sample.txt
$BASEDIR/../PERL-TOOLS/perl/transpose.pl /tmp/sample.txt > /tmp/vpInferences.${sample_name}.tab

