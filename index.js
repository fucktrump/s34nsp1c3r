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

const timers = [
  later.parse.text('at 8:42 am'),
  later.parse.text('at 6:59 am'),
  later.parse.text('at 6:52 pm'),
].map(schedule => {
  later.setInterval(tweet, schedule)
})

if (process.env.APP_URL) {
  console.log('setting up ping')

  const server = http.createServer((request, response) => {
    response.end('n9y25ah7')
    console.log('ping')
  })

  server.listen(process.env.PORT, () => {
    const ping = () => {
      http.get(process.env.APP_URL)
    }

    ping()
    setInterval(ping, 300000) // 5 minutes
  })
}
