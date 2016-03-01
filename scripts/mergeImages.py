#!/usr/bin/env	python

from PIL import Image

from optparse import OptionParser
parser = OptionParser()
parser.add_option("--text",dest="text",action="store",default=None, help="Text .png image")
parser.add_option("--wheel",dest="wheel",action="store",default=None, help="Hallmark Wheel .png image")
parser.add_option("--output",dest="output",action="store",default=None)
(opts, args) = parser.parse_args()

text_img = Image.open(opts.text)
wheel = Image.open(opts.wheel)
wheel = wheel.resize( (1230,1230), Image.NEAREST)
text_img.paste(wheel, (1350,110), wheel)
text_img.save(opts.output+'/'+"merged_images.png", "PNG")

