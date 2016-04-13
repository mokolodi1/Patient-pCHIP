#!/usr/bin/env	python


import sys


header = None

# 'scaled_estimate'
rsem_idx = []

for line in sys.stdin:
	parts = line.rstrip().split('\t')

	if parts[0] == 'Hybridization REF':

		header = [name[0:16] for name in parts]
		continue

	elif parts[0] == 'gene_id':

		for i in range(0, len(parts)):
			if parts[i] == 'scaled_estimate': 
				rsem_idx.append(i)

		print 'Key\t'+'\t'.join([header[i] for i in rsem_idx])

		continue


	hugo_id = parts[0].split('|')[0]
	if hugo_id == '?':
		continue

	scaled = float("1e6")
	print hugo_id+'\t'+'\t'.join([str(float(parts[i])*scaled) for i in rsem_idx])
		
