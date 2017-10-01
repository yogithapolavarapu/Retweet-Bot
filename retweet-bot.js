TWITTER_CONSUMER_KEY    = "";
TWITTER_CONSUMER_SECRET = "";
TWITTER_ACCESS_TOKEN    = "";
TWITTER_ACCESS_SECRET   = "";
TWITTER_SEARCH_PHRASE   = "python";

//variables for array of excluded words and a variable for the length of the array
//words will be added as I continue to find false positives
var excluded = ["Monty", "monty", "lurking", "Lurking", "ball python", "snake", "Snake", "Biafra", "biafra", "montypython", "MontyPython", "pet", "Pet", "Dance", "dance", "Police", "police", "Leather", "leather"];
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
    
    //reduced function to check if tweet is relevant enough for bot to retweet
    //filters based on word list and sensitivity
    //if any of the if conditions match, it returns false (not relevant) and fetchTweets will not fetch it
    //otherwise it returns the tweet
      function isTweetRelevant(tweetobj){
        
        for (var i = 0; i < numexcluded; i++){
          if (tweetobj.text.indexOf(excluded[i]) !== -1 || tweetobj.possibly_sensitive){
            
            return false;
          }
        }
        
        //return true only if return false hasn't triggered from the loop
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