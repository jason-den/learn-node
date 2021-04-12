const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const { setupDB, userOne, userOneId } = require('./fixtures/db')
beforeEach(setupDB)

const userTwo = {
  name: 'Mark',
  email: 'mark.peter@example.com',
  password: 'HisPass77@#',
}

test('Should signup a new user', async () => {
  const response = await request(app).post('/users').send(userTwo).expect(201)
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  expect(response.body).toMatchObject({
    user: { name: user.name, email: user.email },
    token: user.tokens[0].token,
  })

  expect(user.password).not.toBe(userOne.password)
})
test('Should login an exsisting user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send(userOne)
    .expect(200)
  expect(response.body.user._id).toEqual(String(userOneId))
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()
  expect(response.body).toMatchObject({
    token: user.tokens[1].token,
  })
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

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
  })

  test('should 401 for unauthenticated user', async () => {
    await request(app).delete('/users/me').send().expect(401)
  })
})

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.png')
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})
