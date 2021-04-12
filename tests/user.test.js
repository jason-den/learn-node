const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const userOne = {
  name: 'Jason',
  email: 'jason.den@example.com',
  password: 'MyPass77@#',
}
const userTwo = {
  name: 'Mark',
  email: 'Mark.Peter@example.com',
  password: 'HisPass77@#',
}

beforeEach(async () => {
  await User.deleteMany()
  const user = new User(userOne)
  await user.save()
})

test('Should signup a new user', async () => {
  await request(app).post('/users').send(userTwo).expect(201)
})
test('Should login an exsisting user', async () => {
  await request(app).post('/users/login').send(userOne).expect(200)
})
