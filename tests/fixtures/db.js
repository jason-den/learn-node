const { Types } = require('mongoose')
const jwt = require('jsonwebtoken')

const User = require('../../src/models/user')

const userOneId = new Types.ObjectId()
const userOne = {
  _id: userOneId,
  name: 'Jason',
  email: 'jason.den@example.com',
  password: 'MyPass77@#',
  tokens: [{ token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }],
}

const setupDB = async () => {
  await User.deleteMany()
  const user = new User(userOne)
  await user.save()
}

module.exports = { setupDB, userOne, userOneId }
