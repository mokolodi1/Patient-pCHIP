#!/bin/bash

BASEDIR="$(dirname $0)"

upstream_nodes=NFATC2:PTK6:EGFR:PRKAA2:PRKDC:MAP2K2:CBL:NDRG1:NEK4:SIK2:MAP3K2:SS18L1:MAPK3:MAPK1:GAK:TRIM28:RALGDS:MDC1:CUX1:TP53:BRD3:RPS6KA4:AKT1:EIF2AK1:SDC4:NOTCH1:ALDH2:APC
downstream_nodes=DNMT3B:E2F7:PSRC1:IGF1:E2F1:SMAD4:DNMT1:TIMELESS:PSMC3IP:GTF2H4:SUV39H1:ZNF540:ZNF655:MYBL2:HIP1:UHRF1

output=TEST_OUTPUT
scaffold=$BASEDIR/drake_paull_scaffold.txt
gene_universe=$BASEDIR/GSEA_SETS/multinet.genes.lst

$BASEDIR/run.sh $upstream_nodes $downstream_nodes $output $scaffold $gene_universe --kinases AKT1 --mutations TP53:APC --amps AR $scaffold 
