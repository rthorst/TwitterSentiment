# TwitterSent is a Sentiment Analysis App for Twitter

TwitterSent can provide real-time sentiment analysis for any keyword you choose, for example, "data science."

![alt text](https://raw.githubusercontent.com/rthorst/TwitterSentiment/master/home_screen.PNG)

After a keyword is entered, the app mines a few hundred recent tweets - for example about "data science" - and displays information about how positive or negative these tweets are. 

![alt text](https://raw.githubusercontent.com/rthorst/TwitterSentiment/master/data%20science.PNG)

# How TwitterSent Works

TwitterSent retrieves tweets in response to a keyword using the twitter API, specifically the Python library tweepy.

![alt text](https://raw.githubusercontent.com/rthorst/TwitterSentiment/master/tweepy.PNG)

Given a tweet, TwitterSent scores the valence ("sentiment") of that tweet using a social media-aware sentiment model called VADER (https://github.com/cjhutto/vaderSentiment) (Hutto & Gilbert, 2014, ISWSM-14). Notice that the model accurately captures the meaning of emojis and other social media-specific tokens. Vader is mostly a lexicon-based model, although the model does include some simple heuristics, for example to capture negation. 

![alt_text](https://raw.githubusercontent.com/rthorst/TwitterSentiment/master/vaderSentiment.PNG)

Once the sentences are scored for sentiment, TwitterSent generates interactive plots of these sentiment scores using the Python library Bokeh. To make the model more explainable, some of the most highly valenced words detected by the model are displayed to explain the classification result. 

![alt_text](https://raw.githubusercontent.com/rthorst/TwitterSentiment/master/bokeh.PNG)

