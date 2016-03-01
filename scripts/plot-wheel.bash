#!/bin/bash

##
## Input: sets_overlap.pl output
## 
##
## Output:
##
##	Constructs a directory with:
##		 data file: columns are hallmarks, 'enrichment' is the sole row key
##		 include.samples (hallmarks, no header)
##		 include.features ('enrichment' is the key)
##


# sets_overlap.pl enrichment scores (data file)
enrichment_file=$1
color_spec=$2
output_folder=$3

BASEDIR="$(dirname $0)"

mkdir -p ${output_folder}

# make input.data
echo 'Key	enrichment' > 1.tmp
grep -v '^>' ${enrichment_file} | cut -d ',' -f 1,2 | sed -e 's/,/	/g' -e 's/	-/	/g' >> 1.tmp
${BASEDIR}/PERL-TOOLS/perl/transpose.pl 1.tmp > ${output_folder}/input.data

# make include.samples and include.features
cp ${BASEDIR}/GSEA_SETS/hallmarks.order ${output_folder}/include.samples
echo 'enrichment' > ${output_folder}/include.features

mkdir "${output_folder}/img"
$BASEDIR/circlePlot.py \
	-s ${output_folder}/include.samples \
	-f ${output_folder}/include.features \
	${output_folder}/img \
	${output_folder}/input.data:${color_spec}

cp ${output_folder}/img/enrichment.png ${output_folder}/hallmarks.png

rm -f 1.tmp

