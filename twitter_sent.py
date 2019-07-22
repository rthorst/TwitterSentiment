import webapp2
import tweepy
import json
import csv
import os
import statistics
import bokeh
from bokeh.io import show, output_file
from bokeh.plotting import figure
from bokeh.models import HoverTool, ColumnDataSource
from bokeh.embed import components, json_item
from bokeh.resources import INLINE
from bokeh.models.glyphs import Line, Text
import numpy as np
import random
import operator
from collections import Counter
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

"""

---AUTHOR: ---
Robert Thorstad
thorstadrs@gmail.com

---LICENSE: ---
MIT License.

---ABOUT: ---
Application to get the sentiment of recent tweets based on a keyword.
Example: 
    keyword -> "taco bell"
    retrieve 300 recent tweets mentioning taco bell.
    get average sentiment.
    plot distribution of tweets and sentiment.
    plot most informative words for this application.
    
This script runs based on google app server.
Expects Python 2.7

Depenencies need to be included in the lib/ directory (pip install -t lib [PACKAGE_NAME])

The main work is done by the MainPage class. The get() method runs the main pipeline of code and returns HTML as a 
string.

Working online version: https://twittersentiment-247018.appspot.com/
"""


def get_tweets(keyword, max_tweets=200):
    """
    Given a keyword as a string (e.g. "data science"), get recent tweets matching that string up to # max_tweets.
    Return a list of tweets, represented as strings.
    """

    # API keys.
    consumer_key = "kNOG1klRMMUYbsjMuY5TKl4lE"
    consumer_secret = "ieghv6WI1qseYly43A0Ra1MPksEw1i5Onma0txfEu5aHantD2v"
    access_key = "3291622062-15ssVc0qpJXf2SFXbA7vgfl1Sooz4Ueo2DGPQVz"
    access_secret = "9XJuzgGSVLnx93tq6NfRzMT07S6o2lzjmHfjt3VRlkqXn"

    # Initialize tweepy API object and authorize using API key.
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_key, access_secret)
    api = tweepy.API(auth)

    """ Get tweets."""

    alltweets = []
    for status in tweepy.Cursor(
        api.search,
        q=keyword + " -RT", # the -RT flag excludes retweets.
        count=1000,
        result_type="recent",
        include_entities=True,
        monitor_rate_limit=True,
        wait_on_rate_limit=True,
        lang="en",
    ).items():

        # get text of the tweet, encoding as utf-8.
        text = str(status.text.encode("utf-8"))

        # add to the data structure, alltweets, holding the tweets.
        alltweets.append(text)

        # if we've reached max_tweets, break.
        if len(alltweets) >= max_tweets:
            break

    return alltweets

class VaderSentimentModel:
    """
    Calculate sentiment using a mostly lexicon-based approach that is optimized for social media.
    Approach is social media aware, for example emoticons are part of the lexicon and tokenization is twitter-sensitive.
    There are also some basic rules, e.g. it's sensitive to negations.
    """

    def __init__(self):

        # Initialize a vader_analyzer object which does the work of sentiment analysis.
        self.vader_analyzer = SentimentIntensityAnalyzer()
        pass

    def classify_sentiment(self, tweet):

        # Classify sentiment of a single tweet.
        # Input tweet:  as string.
        # Return sentiment score :
        #   range -1 (very negaitve) to +1 (very positive).
        #   score is calculated as p(positive) - p(negative)
        #   normalizing to range from -1 to 1.

        # calculate sentiment in a dictionary. key is polarity ("pos", "neg", "neut") and value is probability.
        sentiment_dict = self.vader_analyzer.polarity_scores(tweet)

        # retrieve the compound sentiment score, which is p(pos) - p(neg), but normalized to range from {-1, 1}
        score = sentiment_dict["compound"] # compound is the combined score scaled to {-1, 1}

        return score

def plot_tweets(tweets, sentiment_scores):
            """
            Create a histogram-style barplot of tweets and their sentiment.
            Return a bokeh plot object, expressed as a tuple of (resources, script, div).
            Where :
                resources: some CSS, etc. that goes in the head of the webpage for styling the plot.
                script:   javascript for the plot to function.  expressed as string.
                div:      html div container for the plot. expressed as string.
            """

            # Sort tweets from negative to positive.
            # This step is not strictly necessary, but makes it easier to see the overall shape of the data.
            sorted_indices = np.argsort(sentiment_scores)
            sentiment_scores = np.array(sentiment_scores)[sorted_indices]
            tweets = np.array(tweets)[sorted_indices]

            # Express the data as a bokeh data source object.
            source = ColumnDataSource(data={
                "text": tweets,
                "sentiment": sentiment_scores,
                "x": np.arange(len(tweets)),
            })

            """ 
            Create plot. 
            """

            # Create plot object.
            width = 0.9
            p = figure(x_axis_label="Tweet", y_axis_label="Sentiment (0 = Neutral)")
            p.vbar(source=source, x="x", top="sentiment", width=width)

            # Add hover tool, allowing mouseover to view text and sentiment.
            hover = HoverTool(
                tooltips=[
                    ("text", "@text"),
                    ("sentiment", "@sentiment")
                ],
                formatters={
                    "text": "printf",
                    "sentiment": "printf"
                },
                mode="vline"
            )
            p.add_tools(hover)

            """
            Format plot.
            """

            # axis font size
            p.xaxis.axis_label_text_font_size = "15pt"
            p.yaxis.axis_label_text_font_size = "15pt"

            # remove tick marks from axes
            p.xaxis.major_tick_line_color = None
            p.xaxis.minor_tick_line_color = None
            p.yaxis.major_tick_line_color = None
            p.yaxis.minor_tick_line_color = None

            # adjust plot width, height
            scale = 1.5
            p.plot_height = int(250 * scale)
            p.plot_width = int(450 * scale)

            # remove toolbar (e.g. move, resize, etc) from right of plot.
            p.toolbar.logo = None
            p.toolbar_location = None

            # remove gridlines
            p.xgrid.visible = False
            p.ygrid.visible = False

            # remove x axis tick labels (done by setting label fontsize to 0 pt)
            p.xaxis.major_label_text_font_size = '0pt'

            """
            Export plot
            """

            # Create resources string, which is CSS, etc. that goes in the head of
            resources = INLINE.render()

            # Get javascript (script) and HTML div (div) for the plot.
            script, div = components(p)

            return (resources, script, div)

def plot_reason(tweets, sentiment_scores):
    """
    Plot the top words that lead us to the classification as positive or negative.
    Return:
        script      :       javascript for the plot, expressed as string.
        div         :       html container for the plot, expressed as string.
        NOTE: requires the shared resources attribute from plot_tweets() in the HTML header.
    """

    """
    Calculate the sentiment of each individual token in the tweets.
    """

    # list tokens, keeping only unique tokens (e.g. remove repeated words).
    all_toks = []
    for tweet in tweets:
        toks = tweet.lower().split()
        all_toks.extend(toks)
    all_toks = [tok for tok in set(all_toks)]  # remove duplicates.

    # calculate sentiment of each token.
    sm = VaderSentimentModel()
    toks_sentiment = [sm.classify_sentiment(tok) for tok in all_toks]

    """            
    sort tokens by sentiment.
    if overall valence is negative, sort negative to postitive.
    if overall valence is positive, sort positive to negative.
    thus, in any case, the earliest elements in the list are the most informative words.
    """

    nwords = 20

    # negative? sort neg -> positive.
    if np.mean(sentiment_scores) < 0:
        sorted_indices = np.argsort(toks_sentiment)
    # else (positive)? sort positive -> negative
    else:
        sorted_indices = np.argsort(toks_sentiment)[::-1]

    # toks_to_plot: shape (nwords, ) list of informative tokens.
    # sentiment_to_plot: shape (nwords, ) list of sentiment of these tokens.
    toks_to_plot = np.array(all_toks)[sorted_indices][:nwords]
    sentiment_to_plot = np.array(toks_sentiment)[sorted_indices][:nwords]

    # convert all sentiment scores to positive values.
    # this is for DISPLAY only, to make all plots go from left to right.
    # we still retain the correct tokens and sorting order.
    sentiment_to_plot = np.array([abs(v) for v in sentiment_to_plot])

    """
    Set up plot.
    - create data source object.
    - define formatting variables. 
    """
    text_offset = 0.1

    source = ColumnDataSource(data={
        "token": toks_to_plot,
        "sentiment": sentiment_to_plot,
        "x": np.arange(len(toks_to_plot))[::-1],
        "label_x": sentiment_to_plot + text_offset
    })

    """
    Make plot.
    """

    # Create initial plot.
    width = 0.9
    xrange = [0, max(sentiment_to_plot) + 1]
    p2 = figure(x_axis_label="Sentiment", y_axis_label="Word", x_range=xrange)
    p2.hbar(source=source, y="x", right="sentiment", height=width)

    """
    Format plot.
    """

    # Annotate each bar with the word being represented.
    glyph = Text(x="label_x", y="x", text="token")
    p2.add_glyph(source, glyph)

    # Axis labels.
    p2.xaxis.axis_label_text_font_size = "15pt"
    p2.yaxis.axis_label_text_font_size = "15pt"

    # Remove ticks.
    p2.xaxis.major_tick_line_color = None
    p2.xaxis.minor_tick_line_color = None
    p2.yaxis.major_tick_line_color = None
    p2.yaxis.minor_tick_line_color = None

    # Remove y axis tick labels.
    p2.yaxis.major_label_text_font_size = '0pt'

    # Plot width, height.
    scale = 1.5
    p2.plot_height = int(250 * scale)
    p2.plot_width = int(250 * scale)

    # remove toolbar (e.g. move, resize, etc) from right of plot.
    p2.toolbar.logo = None
    p2.toolbar_location = None

    # remove gridlines
    p2.xgrid.visible = False
    p2.ygrid.visible = False

    # remove x axis tick labels (set font to 0pt)
    p2.xaxis.major_label_text_font_size = '0pt'

    # get bokeh component for plot 2.
    script2, div2 = components(p2)

    return (script2, div2)

class MainPage(webapp2.RequestHandler):
    """
    This class does the work of writing HTML to the google app server.
    Thus, we allow the get() method to incorporate:

        our main pipeline   (getting tweets, analyzing sentiment, producing graphs)
        writing html

    """

    def get(self):

        """
        Get tweets and sentiment scores.
        """

        # Retrieve keyword from the HTML form. If no keyword provided, use a random suggested keyword.
        keyword = self.request.get("keyword")
        if not keyword:
            suggested_keywords = ["alarm clocks", "the future", "miller lite", "taco bell", "yoga", "netflix",
                                  "life", "traffic", "elon musk", "beards", "world trade", "pepsi", "amazon"]
            indices = np.arange(suggested_keywords)
            random.shuffle(indices)
            keyword = suggested_keywords[indices[0]]
            
        # Get recent tweets based on the keyword, up to 300 maximum tweets.
        tweets = get_tweets(keyword, max_tweets=300)

        # Compute the sentiment of each tweet.
        v = VaderSentimentModel()
        sentiment_scores = [v.classify_sentiment(tw) for tw in tweets] # shape (ntweets,)

        # Label sentiment categorically, e.g. "negative" or "positive"
        M_sent = np.mean(sentiment_scores)
        map = {1 : "positive", 0 : "negative"}
        valence = map[int(M_sent > 0)]

        """
        Create plots. 
        """

        #############
        # Plot #1:
        ############
        # Plot the distribution of tweets and sentiment.
        # Resources is CSS code that goes in the header of the HTML. Shared across all bokeh plots.
        # Script1 is javascript for this plot.
        # Div1 is an HTML container for the plot. Goes where you want the plot to appear.
        resources, script1, div1 = plot_tweets(tweets=tweets, sentiment_scores=sentiment_scores)

        #############
        # Plot #2:
        ############
        # Plot the key words that lead us to this classification.
        # Script2 is javascript for this plot.
        # Div2 is an HTML container for this plot. Goes where you want the plot to appear.
        # Requires the HTML to include the shared resources, generated above, in the <HEAD>
        script2, div2 = plot_reason(tweets=tweets, sentiment_scores=sentiment_scores)

        """
        Create HTML output. 
        """

        # Load HTML template.
        # This is a functioning webpage, with some placeholders for the keywords and plots we have created.
        html_p = os.path.join("html", "index.html")
        html = open(html_p, "r").read()

        # Fill in placeholders in the HTML with varibles we have created.
        term_to_value = {
            "[[!KEYWORD]]" : keyword,
            "[[!VALENCE]]" : valence,
            "[[!BOKEH_SCRIPT]]" : script1,
            "[[!BOKEH_SCRIPT2]]": script2,
            "[[!BOKEH_DIV]]" : div1,
            "[[!BOKEH_RESOURCES]]" : resources,
            "[[!BOKEH_DIV2]]" : div2
        }
        for term, val in term_to_value.items():
            html = html.replace(term, val)

        """
        Write a response.
        This essentially returns HTML to the google app engine.
        This will render a webpage visible to the user. 
        """
        self.response.headers["Content-Type"] = "text/html"
        self.response.write(html)


# Run application.
routes = [('/', MainPage)]
my_app = webapp2.WSGIApplication(routes, debug=True)