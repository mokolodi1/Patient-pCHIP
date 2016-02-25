#!/usr/bin/env	python

from PIL import Image
text_img = Image.open("Text.png")
wheel = Image.open("Wheel.png")
wheel = wheel.resize( (1230,1230), Image.NEAREST)
text_img.paste(wheel, (1350,110), wheel)
text_img.save("merged_images.png", "PNG")

