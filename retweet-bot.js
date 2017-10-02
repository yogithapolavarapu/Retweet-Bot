TWITTER_CONSUMER_KEY    = "";
TWITTER_CONSUMER_SECRET = "";
TWITTER_ACCESS_TOKEN    = "";
TWITTER_ACCESS_SECRET   = "";
TWITTER_SEARCH_PHRASE   = "python";
TWITTER_SEARCH_PHRASE_2 = "Monty";
TWITTER_SEARCH_PHRASE_3 = "lurking";



 
function Start_Bot() {
  
  var props = PropertiesService.getScriptProperties();
  //store key-value pairs consumer secret and key., access token and secret
  
  props.setProperties({ 
    TWITTER_CONSUMER_KEY: TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET: TWITTER_CONSUMER_SECRET,
    TWITTER_ACCESS_TOKEN: TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET: TWITTER_ACCESS_SECRET,
    SINCE_TWITTER_ID: 0
  });
  
  var twit = new Twitter.OAuth(props);
  
  // Test Twitter authorization
  
  //to stop any existing triggers
  Stop_Bot();
  
  ScriptApp.newTrigger("retweet_Python")
  .timeBased()
  .everyMinutes(10)
  .create();
  
}


function Stop_Bot(){
  
  var triggers = ScriptApp.getProjectTriggers();
  
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}
 
function retweet_Python() {
  
  try {
    
    var props = PropertiesService.getScriptProperties(),
        twit = new Twitter.OAuth(props);
    
    if (twit.hasAccess()) {
      
      var tweets = twit.fetchTweets(
        TWITTER_SEARCH_PHRASE, function(tweet) {
          // Skip tweets that contain sensitive content
          if (!tweet.possibly_sensitive && !tweet.includes(TWITTER_SEARCH_PHRASE_2) && !tweet.includes(TWITTER_SEARCH_PHRASE_3)) {
            return tweet.id_str;
          }
        }, {
          multi: true,
          lang: "en", // Process only English tweets
          count: 5,   // Process 5 tweets in a batch
          since_id: props.getProperty("SINCE_TWITTER_ID")
        });
      
      if (tweets.length) {
        
        props.setProperty("SINCE_TWITTER_ID", tweets[0]);
        
        for (var i = tweets.length - 1; i >= 0; i--) {
          
          twit.retweet(tweets[i]);
          
          /* Wait between 10 seconds and 1 minute */
          Utilities.sleep(Math.floor(Math.random()*50000) + 10000);
          
        }
      }
    }
    
  } catch (f) {
    Logger.log("Error: " + f.toString());
  }
  
}
