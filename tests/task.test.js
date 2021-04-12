const request = require('supertest')

const app = require('../src/app')
const Task = require('../src/models/task')

const { setupDB, userOne, userOneId } = require('./fixtures/db')
beforeEach(setupDB)

const taskOne = { description: 'My test task' }

test('should create task for user', async () => {
  const response = await request(app)
    .post('/tasks', taskOne)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send(taskOne)
    .expect(201)
  const task = await Task.findById(response.body._id)
  expect(task).not.toBeNull()
  expect(task).toMatchObject({
    description: taskOne.description,
    owner: userOneId,
  })
})
