#!/usr/bin/env	python


import sys


header = None

# 'scaled_estimate'
normal_idx = []
rsem_idx = []

for line in sys.stdin:
	parts = line.rstrip().split('\t')

	if parts[0] == 'Hybridization REF':

		header = [name[0:16] for name in parts]

		for i in range(1, len(parts)):
			sample = parts[i][0:16]
			if sample.endswith('11A') or sample.endswith('11B') or sample.endswith('11C'):
				normal_idx.append(i)
		continue

	elif parts[0] == 'gene_id':

		for i in normal_idx:
			if parts[i] == 'scaled_estimate': 

				rsem_idx.append(i)

		print 'Key\t'+'\t'.join([header[i] for i in rsem_idx])

		continue


	hugo_id = parts[0].split('|')[0]
	if hugo_id == '?':
		continue

	scaled = float("1e6")
	print hugo_id+'\t'+'\t'.join([str(float(parts[i])*scaled) for i in rsem_idx])
		
