TWITTER_CONSUMER_KEY    = "";
TWITTER_CONSUMER_SECRET = "";
TWITTER_ACCESS_TOKEN    = "";
TWITTER_ACCESS_SECRET   = "";
TWITTER_SEARCH_PHRASE   = "python -filter:nativeretweets -filter:retweets -filter:replies"; 
//filters out replies, retweets, and old-style retweets(RT)

//variables for array of excluded words and a variable for the length of the array
//words will be added as I continue to find false positives
var excluded = ["Monty", "monty", "lurking", "Lurking", "ball python", "snake", "Snake", "Biafra", "biafra", "BIAFRA", "Biafrans", "biafrans",
                "montypython", "MontyPython", "pet", "Pet", "#pet", "Dance", "dance", "Police", "police", "Leather", "leather",
                "Pants", "pants", "Handbag", "handbag", "forsyth", "Forsyth", "Ball Python" , "Nigeria", "nigeria", "creatur.io", "Slither.io",
                "BallPython", "ballpython", "#BallPython", "#ballpython", "Python Temple", "#pythontemple", "Luthier", "versace", "Versace", "Python's Realm",
                "Dangerous", "jaw", "swallow", "Swallow", "Kyle Python", "Python Plan", "Python Skin", "python skin", "zoo", "Zoo"];
//all of the Biafra/Nigeria/Dance references are because "python" is a symbol in some political current events going on there


var numexcluded = excluded.length;
 
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
  
  var twit = new Twitterlib.OAuth(props);
  
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
  
      function isTweetRelevant(tweetobj){
        
        //if the tweet text property does not contain the word python in some form, return false
        //this is a relatively strict rule which may skip semi-relevant tweets. it may filter out some okay results but may be necessary for quality
        if(tweetobj.text.indexOf("python") == -1 && tweetobj.text.indexOf("Python") == -1){
          return false;
        }
        //make object into a string to search the entire object for unwanted phrases
        var objstr = JSON.stringify(tweetobj)
        
        //if the tweet is sensitive or contains a non-allowed word, return false
        for (var i = 0; i < numexcluded; i++){
              if (objstr.indexOf(excluded[i]) !== -1 || tweetobj.possibly_sensitive){
                return false;
                }
              }

        
        //return true only if return false hasn't triggered from the conditions above
        return true;
      }

   
    
    if (twit.hasAccess()) {
      
      var tweets = twit.fetchTweets(
        TWITTER_SEARCH_PHRASE, function(tweet){
          return isTweetRelevant(tweet);
        }, {
          multi: true,
          lang: "en", // Process only English tweets
          count: 5,   // Process 5 tweets in a batch
          since_id: props.getProperty("SINCE_TWITTER_ID")
        });
      
      if (tweets.length) {
        
        props.setProperty("SINCE_TWITTER_ID", tweets[0].id_str);
        
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
