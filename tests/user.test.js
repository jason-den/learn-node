const { Types } = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const jwt = require('jsonwebtoken')

const userOneId = new Types.ObjectId()
const userOne = {
  _id: userOneId,
  name: 'Jason',
  email: 'jason.den@example.com',
  password: 'MyPass77@#',
  tokens: [{ token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }],
}
const userTwo = {
  name: 'Mark',
  email: 'mark.peter@example.com',
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
describe('Should not login with wrong credentials', () => {
  test('wrong password', async () => {
    await request(app)
      .post('/users/login')
      .send({ email: userOne.email, password: 'the wrong password' })
      .expect(400)
  })
  test('nonexisting email', async () => {
    await request(app)
      .post('/users/login')
      .send({ email: 'nobody@whatever.com', password: 'nopenope' })
      .expect(400)
  })
})

describe('on /users/me', () => {
  test('Should get profile for authenticated user', async () => {
    await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
  })
  test('Should not get profile for unauthenticated user', async () => {
    await request(app)
      .get('/users/me')
      .set('Authorization', `wrong token`)
      .send()
      .expect(401)

    await request(app).get('/users/me').send().expect(401)
  })
})

describe('on delete account', () => {
  test('should delete account for user', async () => {
    await request(app)
      .delete('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
  })
  test('should 401 for unauthenticated user', async () => {
    await request(app).delete('/users/me').send().expect(401)
  })
})
