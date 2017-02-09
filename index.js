require('dotenv').config()
const Twit = require('twit')
const later = require('later')
const generatePassword = require('password-generator')
const http = require('http')
const zalgo = require('zalgolize')

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
})

// Well, this is it.
const createTweet = () => {
  const password = generatePassword(8, false)

  return process.env.ZALGO
    ? zalgo(password, 0.7, [2, 1, 2])
    : password
}

// Post a tweet with an optional tweet to reply to.
const postTweet = (inReplyToTweet) => {
  const status = createTweet(inReplyToTweet)

  const options = !inReplyToTweet
    ? { status }
    : {
      status: `@${inReplyToTweet.user.screen_name} ${status}`,
      in_reply_to_status_id: inReplyToTweet.id_str,
    }

  T.post('statuses/update', options, (err, data, response) => {
    console.log(`tweeted: ${options.status}`)
  })
}

if (process.env.SCHEDULE) {
  // Schedule tweets using later: https://bunkat.github.io/later/
  const schedule = later.parse.recur().on(
    // These were the times (in UTC, interpreted in EST)
    // when @PressSec tweeted mysterious 8-character strings.
    '11:59:00',
    '13:42:00',
    '23:52:00'
  ).time()

  later.setInterval(postTweet, schedule)
}

// Subscribe to the user stream and listen for tweets
T.stream('user')
  .on('tweet', (tweet) => {
    // Ignore retweets and the bot itself.
    if (!tweet.retweeted_status && tweet.user.screen_name !== process.env.SCREEN_NAME) {
      postTweet(tweet)
    }
  })

if (process.env.HEROKU_URL) {
  const server = http.createServer((req, res) => {
    res.end(createTweet())
  })

  server.listen(process.env.PORT || 1337, () => {
    const ping = () => {
      console.log('ping')
      http.get(process.env.HEROKU_URL)
    }

    ping()
    // Ping the server every 5 minutes to keep the bot running.
    setInterval(ping, 300000)
  })
}
