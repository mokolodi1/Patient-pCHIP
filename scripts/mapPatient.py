#!/usr/bin/env	python


from optparse import OptionParser
parser = OptionParser()
parser.add_option("--scaffold",dest="scaffold",action="store",default=None, help=
	" Scaffold network to map patient data to")
(opts, args) = parser.parse_args()
from pathway import Pathway, NodeConsistencyValidator, BasicPathValidator
import networkx as nx

def parseFullNet(file):
	"""
	Parse peptide-peptide edges that look like:

	PRKCZ	TRIM24	QALPPFQPQITDDYGLDNFDTQFTSEPVQLpTPDDEDAIK:FSDDpSDDDFVQPR	0.3206742789	+	1	-phos>

	We're only interested in retaining the peptides and gene-gene interactions, along with the 
	edge interaction type in the final column.

	Returns:
		gene-gene interaction network in net[geneA] = set( (i_B, geneB), ... ) structure
		peptide-peptide interaction network in net[pepA] = set( (i_B, pepB), ... ) structure
	"""
	# gene-gene edges
	network = {}
	network_nodes = set()
	# peptide-peptide edges
	phos_network = {}
	phos_edges = set()
	# map genes to peptides
	map = {}
	for line in open(file, 'r'):
		parts = line.rstrip().split('\t')
		a, b, phos, score, sign, functional, interaction = parts
		peptideA, peptideB = phos.split(':')
		phos_edges.add((peptideA, peptideB))

		# 'PPI>' edges are undirected: add an edge in the opposite direction
		if interaction == 'PPI>':
			phos_edges.add((peptideB, peptideA))

		network_nodes.add( a )
		network_nodes.add( b )

		if a not in network:
			network[a] = set()
		network[a].add((interaction, b))

		if peptideA not in phos_network:
			phos_network[peptideA] = set()
		phos_network[peptideA].add((interaction, peptideB))

		if a not in map:
			map[a] = set()
		map[a].add(peptideA)
		if b not in map:
			map[b] = set()
		map[b].add(peptideB)
		
	return (network, network_nodes, phos_network, phos_edges, map)


def parseList(inputs, valid_nodes):
	"""
	Process the inputs and validate against the scaffold nodes
	"""
	input_set = set()
	# nodes not in the scaffold network: report these
	exclude_set = set()
	for gene in inputs.split(':'):

		if gene not in valid_nodes:
			exclude_set.add( gene )
		else:
			input_set.add(gene)

	return (input_set, exclude_set)


network, net_nodes, phos_network, valid_phos_edges, gene_to_peptides_map = parseFullNet(opts.scaffold)

upstream_nodes, upstream_notInNetwork = parseList(args[0], net_nodes)
downstream_nodes, downstream_notInNetwork = parseList(args[1], net_nodes)

# create Pathway object with this initialization: the 'scaffold' network is the background graph
validator = BasicPathValidator({'source':upstream_nodes, 'target':downstream_nodes})
pathway = Pathway(network, validator=validator, opts={'undirected_edges':set(['PPI>'])})

# find all paths between soure and target nodes, using PPI> as undirected/bi-directional 
# edges, all others (phos>, -phosphorylates>) as directed.
edges = pathway.allPathEdges(upstream_nodes, downstream_nodes, 4)
	
graph = nx.Graph()
for edge in edges:
	# add edges to nx object
	graph.add_edge(edge[0], edge[2])
node_centrality = nx.betweenness_centrality(graph)

for edge in edges:
	print '\t'.join(edge)
