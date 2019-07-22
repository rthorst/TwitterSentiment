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

def get_tweets(keyword, max_tweets=200):
    """
    Get recent max_tweets matching keyword
    Return a list of tweets as strings
    """

    consumer_key = "kNOG1klRMMUYbsjMuY5TKl4lE"
    consumer_secret = "ieghv6WI1qseYly43A0Ra1MPksEw1i5Onma0txfEu5aHantD2v"
    access_key = "3291622062-15ssVc0qpJXf2SFXbA7vgfl1Sooz4Ueo2DGPQVz"
    access_secret = "9XJuzgGSVLnx93tq6NfRzMT07S6o2lzjmHfjt3VRlkqXn"

    # authorize twitter, initialize tweepy
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_key, access_secret)
    api = tweepy.API(auth)

    # initialize a list to hold all the tweepy Tweets
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

        # get text.
        text = str(status.text.encode("utf-8"))

        # only keep if not retweet.
        alltweets.append(text)

        # break if too many tweets.
        if len(alltweets) >= max_tweets:
            break

    return alltweets

class VaderSentimentModel:
    """ Calculate sentiment using a lexicon-based approach from Stanford historical sentiment lexicon year 2000"""

    def __init__(self):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        pass


    def classify_sentiment(self, tweet):
        sent_dict = self.vader_analyzer.polarity_scores(tweet)
        score = sent_dict["compound"] # compound is the combined score scaled to {-1, 1}
        return score

class MainPage(webapp2.RequestHandler):
    """ The web application call the get() method. and expects html defined by self.response.write

    """
    def get(self):

        """ Get tweets and sentiment """

        # get tweets
        keyword = self.request.get("keyword")
        if not keyword:
            suggested_keywords = ["alarm clocks", "the future", "miller lite", "taco bell", "yoga", "netflix",
                                  "life", "traffic", "elon musk", "beards", "world trade", "pepsi", "amazon"]
            random.shuffle(suggested_keywords)
            keyword = suggested_keywords[0]
        tweets = get_tweets(keyword)

        # compute sentiment scores, 1 per tweet.
        v = VaderSentimentModel()
        sentiment_scores = [v.classify_sentiment(tw) for tw in tweets] # shape (ntweets,)

        # sort tweets by sentiment, negative to positive.)
        sorted_indices = np.argsort(sentiment_scores)
        tweets = np.array(tweets)[sorted_indices]
        sentiment_scores = np.array(sentiment_scores)[sorted_indices]

        # calculate mean valence as a categorical label.
        M_sent = statistics.mean([v for v in sentiment_scores if v])
        valence = ""
        if M_sent > 0:
            valence = "positive"
        else:
            valence = "negative"

        """ Generate a histogram of sentiment, as bokeh plot object. """
        source = ColumnDataSource(data={
            "text": tweets,
            "sentiment": sentiment_scores,
            "x": np.arange(len(tweets)),
            "mean_line" : [M_sent] * len(tweets)
        })

        # create figure.
        width = 0.9
        p = figure(x_axis_label="Tweet", y_axis_label="Sentiment (0 = Neutral)")
        p.vbar(source=source, x="x", top="sentiment", width=width)

        # add hover tool.
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

        # formatting axes.
        p.xaxis.axis_label_text_font_size = "15pt"
        p.yaxis.axis_label_text_font_size = "15pt"

        # remove ticks marks on axes.
        p.xaxis.major_tick_line_color = None
        p.xaxis.minor_tick_line_color = None
        p.yaxis.major_tick_line_color = None
        p.yaxis.minor_tick_line_color = None

        # change plot width, height.
        scale = 1.5
        p.plot_height = int(250 * scale)
        p.plot_width = int(450 * scale)

        # remove toolbar (e.g. move, resize, etc) from right of plot.
        p.toolbar.logo = None
        p.toolbar_location = None

        # remove gridlines
        p.xgrid.visible = False
        p.ygrid.visible = False

        # remove x axis tick labels (set font to 0pt)
        p.xaxis.major_label_text_font_size = '0pt'

        # create resources e.g. CSS and stuff), which goes in the header of the HTML document
        resources = INLINE.render()

        # get the text of javascript and HTML div to express the plot.
        script, div = components(p)

        # list negative tweets.
        negative_tweets = " ".join([tw for tw, sent in zip(tweets, sentiment_scores) if sent>0])
        negative_tweets = "".join([c for c in negative_tweets if ord(c) < 128])

        """
        Generate a bokeh plot of words that lead us to this categorization.
        """

        # list all words in the tweets and their sentiment.
        all_toks = []
        for tweet in tweets:
            toks = tweet.lower().split()
            all_toks.extend(toks)
        all_toks = [tok for tok in set(all_toks)]
        sm = VaderSentimentModel()
        toks_sentiment = [sm.classify_sentiment(tok) for tok in all_toks]

        # sort tokens by sentiment.
        nwords = 20
        if M_sent < 0:
            # Negative tweets? sort negative to positive.
            sorted_indices = np.argsort(toks_sentiment)
        else:
            # Positive tweets? sort positive to negative.
            sorted_indices = np.argsort(toks_sentiment)[::-1]

        # keep only nwords tokens and sentiment scores.
        toks_to_plot = np.array(all_toks)[sorted_indices][:nwords]
        sentiment_to_plot = np.array(toks_sentiment)[sorted_indices][:nwords]


        text_offset = 0.1

        # convert sentiment values to positive values, to make both plots format identically.
        sentiment_to_plot = np.array([abs(v) for v in sentiment_to_plot])

        source = ColumnDataSource(data={
            "token" : toks_to_plot,
            "sentiment" : sentiment_to_plot,
            "x" : np.arange(len(toks_to_plot))[::-1],
            "label_x": sentiment_to_plot + text_offset
        })

        # create figure.
        width = 0.9
        xrange = [0, max(sentiment_to_plot) + 1]

        p2 = figure(x_axis_label="Sentiment", y_axis_label="Word", x_range=xrange)
        p2.hbar(source=source, y="x", right="sentiment", height=width)

        # annotate with text.
        glyph = Text(x="label_x", y="x", text="token")
        p2.add_glyph(source, glyph)

        # formatting axes.
        p2.xaxis.axis_label_text_font_size = "15pt"
        p2.yaxis.axis_label_text_font_size = "15pt"

        # remove ticks marks on axes.
        p2.xaxis.major_tick_line_color = None
        p2.xaxis.minor_tick_line_color = None
        p2.yaxis.major_tick_line_color = None
        p2.yaxis.minor_tick_line_color = None

        # remove y axis tick labels (by setting fontsize to 0)
        p2.yaxis.major_label_text_font_size = '0pt'

        # change plot width, height.
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

        """ Create HTML """

        # Load templated HTML, which needs some variables filled in.
        html_p = os.path.join("html", "index.html")
        html = open(html_p, "r").read()

        term_to_value = {
            "[[!KEYWORD]]" : keyword,
            "[[!VALENCE]]" : valence,
            "[[!BOKEH_SCRIPT]]" : script,
            "[[!BOKEH_SCRIPT2]]": script2,
            "[[!BOKEH_DIV]]" : div,
            "[[!BOKEH_RESOURCES]]" : resources,
            "[[!BOKEH_DIV2]]" : div2
        }
        for term, val in term_to_value.items():
            html = html.replace(term, val)

        """ Write Response """
        self.response.headers["Content-Type"] = "text/html"
        self.response.write(html)

routes = [('/', MainPage)]

my_app = webapp2.WSGIApplication(routes, debug=True)