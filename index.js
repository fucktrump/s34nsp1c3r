require('dotenv').config()
const Twit = require('twit')
const later = require('later')
const generatePassword = require('password-generator')
const http = require('http')

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
})

const sendTweet = (mention = '', data = {}) => {
  const password = generatePassword(8, false)
  const status = mention
    ? `${mention} ${password}`
    : password

  T.post('statuses/update', Object.assign({ status }, data))

  console.log(`tweeted: ${status}`)
}

const schedule = later.parse.recur().on(
  '11:59:00',
  '13:42:00',
  '23:52:00'
).time()

later.setInterval(sendTweet, schedule)

T.stream('user', { follow: ['PressSec'] })
  .on('tweet', (tweet) => {
    sendTweet('@PressSec', {
      in_reply_to_status_id: tweet.id_str
    })
  })

sendTweet('@PressSec')

if (process.env.APP_URL) {
  console.log('setting up ping')

  const server = http.createServer((request, response) => {
    response.end('n9y25ah7')
    console.log('ping')
  })

  server.listen(process.env.PORT || 1337, () => {
    const ping = () => {
      http.get(process.env.APP_URL)
    }

    ping()
    setInterval(ping, 300000) // 5 minutes
  })
}
