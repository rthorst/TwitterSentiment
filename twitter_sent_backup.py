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
import numpy as np

def get_tweets(keyword, max_tweets=50):
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

class SentimentModel:
    """ Calculate sentiment using a lexicon-based approach from Stanford historical sentiment lexicon year 2000"""

    def __init__(self):

        # Load lexicon.
        self.word_to_sentiment = {}
        lexicon_p = os.path.join("frequent_words", "2000.tsv")
        f = open(lexicon_p, "r")
        r = csv.reader(f, dialect='excel-tab')

        for word, m_sentiment, sd_sentiment in r:
            self.word_to_sentiment[word] = float(m_sentiment)


    def classify_sentiment(self, tweet):

        lower = tweet.lower()
        tokens = lower.split()
        tokens_sentiment = []

        for tok in tokens:
            if tok in self.word_to_sentiment.keys():
                sentiment  = self.word_to_sentiment[tok]
                tokens_sentiment.append(sentiment)

        # return mean sentiment score.
        if len(tokens_sentiment) == 0:
            return None
        else:
            return statistics.mean(tokens_sentiment)

def compute_sentiment(tweets):
    """
    Compute sentiment of the tweets discovered.
    Return a list of sentiment scores, one score per tweet.
    If can't compute sentiment, we return None. for that tweet.
    """


    # Compute sentiment and write.
    sent_model = SentimentModel()
    sentiment_scores = []
    for tweet in tweets:

        sentiment = sent_model.classify_sentiment(tweet)

        if sentiment:
            sentiment_scores.append(sentiment)
        else:
            sentiment_scores.append(None)

    return sentiment_scores

class MainPage(webapp2.RequestHandler):
    """ The web application call the get() method. and expects html defined by self.response.write

    """
    def get(self):

        """ Get tweets and sentiment """

        # get tweets, list of sentiment scores.
        keyword = self.request.get("keyword")
        tweets = get_tweets(keyword)
        sentiment_scores = compute_sentiment(tweets)

        # calculate mean valence as a categorical label.
        M_sent = statistics.mean([v for v in sentiment_scores if v])
        valence = ""
        if M_sent > 0.1:
            valence = "positive"
        elif M_sent < 0.1:
            valence = "negative"
        else:
            valence = "neutral"

        """ Generate a histogram of sentiment, as bokeh plot object. """
        source = ColumnDataSource(data={
            "text": tweets,
            "sentiment": sentiment_scores,
            "x": np.arange(len(tweets))
        })

        # create figure.
        width = 0.9
        p = figure(x_axis_label="Tweet", y_axis_label="Sentiment")
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

        # get the text of javascript and HTML div to express the plot.
        script, div = components(p)

        """ Create HTML """

        # Load templated HTML, which needs some variables filled in.
        html_p = os.path.join("html", "index.html")
        html = open(html_p, "r").read()

        # Fill in some variables in the HTML with the keyword, results, etc.
        term_to_value = {
            "[[!KEYWORD]]" : keyword,
            "[[!VALENCE]]" : valence,
            "[[!BOKEH_SCRIPT]]" : script,
            "[[!BOKEH_DIV]]" : div
        }
        for term, val in term_to_value.items():
            html = html.replace(term, val)

        """ Write Response """
        self.response.headers["Content-Type"] = "text/html"
        self.response.write(html)

routes = [('/', MainPage)]

my_app = webapp2.WSGIApplication(routes, debug=True)