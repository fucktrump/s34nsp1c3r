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

const tweet = () => {
  const password = generatePassword(8, false)

  T.post('statuses/update', {
    status: password
  })

  console.log(`tweeted: ${password}`)
}

tweet()

const schedule = later.parse.recur().on(
  '11:59:00',
  '13:42:00',
  '23:52:00'
).time()

later.setInterval(tweet, schedule)

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
