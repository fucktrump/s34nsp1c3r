require('dotenv').config()
const Twit = require('twit')
const later = require('later')
const generatePassword = require('password-generator')

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
})

const tweet = () => {
  const password = generatePassword()

  T.post('statuses/update', {
    status: password
  })

  console.log(`tweeted: ${password}`)
}

const timers = [
  later.parse.text('at 8:42 am'),
  later.parse.text('at 6:59 am'),
  later.parse.text('at 6:52 pm'),
].map(schedule => {
  later.setInterval(tweet, schedule)
})

tweet()
