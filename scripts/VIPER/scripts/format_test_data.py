#!/usr/bin/env	python

import sys
from collections import defaultdict

counts = defaultdict(float)
num_false_discoveries = defaultdict(float)
num_true_discoveries = defaultdict(float)

true_counts = defaultdict(int)
num_true_samples = 0
for line in open('true.discoveries.tab', 'r'):

	if line.startswith('Testing'):
		num_true_samples += 1
		continue
		
	sample, gene, sign = line.rstrip().split('\t')
	if sign == '-':
		continue
	indicator = 0
	if sign == '+':
		indicator = 1

	true_counts[gene] += 1
	
	num_true_discoveries[sample] += 1	
	counts[gene+'_'+str(indicator)] += 1

false_counts = defaultdict(int)
num_false_samples = 0
for line in open('false.discoveries.tab', 'r'):

	if line.startswith('Testing'):
		num_false_samples += 1
		continue
		
	sample, gene, sign = line.rstrip().split('\t')
	if sign == '-':
		continue
	indicator = 0
	if sign == '+':
		indicator = 1
	
	num_false_discoveries[sample] += 1	
	#counts[gene+'_'+str(indicator)] += 1
	false_counts[gene] += 1

#print 'event\tfraction'
#for event in counts:
#	print event+'\t'+str(counts[event]/num_samples)

print 'sample\ttype\tcount'
#for sample in num_false_discoveries:
#	print sample+'\tfalse\t'+str(num_false_discoveries[sample])
#for sample in num_true_discoveries:
#	print sample+'\ttrue\t'+str(num_true_discoveries[sample])
for gene in true_counts:
	print gene+'\t'+'true'+'\t'+str(true_counts[gene]/float(num_true_samples))
for gene in false_counts:
	print gene+'\t'+'false'+'\t'+str(false_counts[gene]/float(num_false_samples))
