import bokeh
import numpy as np
from bokeh.io import show, output_file
from bokeh.plotting import figure
from bokeh.models import HoverTool, ColumnDataSource
from bokeh.embed import components, json_item
import pandas as pd
import json

# vars.
n_tweets = 50
width = 0.9

# define data and labels.
texts = ["text of tweet #{} for".format(idx) for idx in np.arange(n_tweets)]
sentiments = np.random.random(n_tweets) * 5
x = np.arange(len(texts))
source = ColumnDataSource(data={
    "text" : texts,
    "sentiment" : sentiments,
    "x" : x
})

# create figure.
x = np.arange(len(sentiments))
p = figure(x_axis_label="Tweet", y_axis_label="Sentiment")
p.vbar(source=source, x="x", top="sentiment", width=width)

# add hover tool.
hover = HoverTool(
    tooltips = [
        ("text", "@text"),
        ("sentiment", "@sentiment")
    ],
    formatters = {
        "text" : "printf",
        "sentiment" : "printf"
    },
    mode = "vline"
)
p.add_tools(hover)

# show plot.
show(p)

# save components.
script, div = components(p)
fnames = ["script.txt", "div.txt"]
htmls = [script, div]
for fname, html in zip(fnames, htmls):
    with open(fname, "w") as of:
        of.write(html)
        print("wrote {}".format(fname))

# save json.
j = json_item(p)
with open("json.txt", "w") as of:
    of.write(json.dumps(j))
print("wrote json.txt")