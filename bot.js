// setup lib & access token
var Twit = require('twit')
var config = require('./config')
var T = new Twit(config)

// setup streams
var stream = T.stream('user')
stream.on('follow', followed)
stream.on('tweet', tweetEvent)

// setup elizanode
var ElizaNode = require('elizanode')
var eliza = new ElizaNode();

console.log('listening...')

function followed(eventMsg) {
  //twitter data
  var name = eventMsg.source.name
  var screenName = eventMsg.source.screen_name

  // reply
  console.log('replying to new follow...')
  tweetIt("🛋 hi @" + screenName + "! I'm ELIZA, a mock-Rogerian psychotherapist. Tweet me!")
}

// eventMsg === json data
function tweetEvent(eventMsg) {
  // // write json to hd
  // var fs = require('fs')
  // var json = JSON.stringify(eventMsg, null, 2)
  // fs.writeFile("tweet.json", json)

  //twitter data
  var screenName = eventMsg.source.screen_name
  var replyto = eventMsg.in_reply_to_screen_name
  var replyid = eventMsg.id_str
  var text = eventMsg.text
  var from = eventMsg.user.screen_name

  // console.log(eventMsg)

  if (replyto === 'weizenbaumbot' && replyid != null) {

    // elizanode takes user reply
    var reply = eliza.transform(text);

    // reply
    console.log('replying to new tweet...')
    var newtweet = '🤔 @' + from + ' ' + reply
    tweetIt(newtweet, replyid)

  } else if (replyto === 'weizenbaumbot' && replyid === null) {
    console.log("this reply id should be null: " + replyid)
    // elizanode initialized
    var initial = eliza.getInitial()

    // reply
    console.log('tweet to ' + from + ' ...')
    var newtweet = '🛋 @' + from + ' ' + initial
    tweetIt(newtweet)
  }
}

function tweetIt(txt, replyid=null) {

  // POST tweets
  var tweet = {
    status: txt,
    in_reply_to_status_id: replyid,
  }

  T.post('statuses/update', tweet, tweeted)
  function tweeted(err, data, response) {
    if (err) {
      console.log("Something went wrong... See error msg below")
      console.log("error message: "  + err.allErrors)
    } else {
      console.log("Things are looking good...")
    }
  }
}
