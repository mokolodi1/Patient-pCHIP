#!/usr/bin/env	python

from PIL import Image

from optparse import OptionParser
parser = OptionParser()
parser.add_option("--kinases",dest="kinases",action="store",default=None)
parser.add_option("--mutations",dest="mutations",action="store",default=None)
parser.add_option("--amps",dest="amps",action="store",default=None)
parser.add_option("--dels",dest="dels",action="store",default=None)
parser.add_option("--tfs",dest="tfs",action="store",default=None)
(opts, args) = parser.parse_args()

def parseNet(file):

	nodes = set()
	header = True
	for line in open(file, 'r'):

		parts = line.rstrip().split('\t')

		# sif input format	
		if len(parts) == 3 and file.endswith('.sif'):
			nodes.add(parts[0])
			nodes.add(parts[2])
		# works for drake_paull_scaffold.txt, guessing for other network types
		elif len(parts) == 2 or len(parts) > 4:
			nodes.add(parts[0])
			nodes.add(parts[1])
	

	return nodes

def parseList(inputs):

	if not inputs:
		return set()

	input_set = set()
	for gene in inputs.split(':'):

		input_set.add(gene)

	return input_set


data = {}
data['Kinases'] = parseList(opts.kinases)
data['Mutations'] = parseList(opts.mutations)
data['Amps'] = parseList(opts.amps)
data['Dels'] = parseList(opts.dels)
data['TFs'] = parseList(opts.tfs)

nodes = parseNet(args[0])
header = ['Gene', 'Kinases', 'Mutations', 'Amps', 'Dels', 'TFs']
print '\t'.join(header)
for gene in nodes:
	printstr = gene
	for label in header:
		if label in data and gene in data[label]:
			printstr += '\t1'
		else:
			printstr += '\t0'
	print printstr
	

