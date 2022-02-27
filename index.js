console.log('Phonebook server is about to start...')

require('dotenv').config()

const express = require('express')
const app = express()

app.use(express.static('react-ui'))

app.use(express.json())

const morgan = require('morgan')

morgan.token('body', function (req, res) {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

const Person = require('./models/person')

/*
const generateId = () => {

  let id
  do {
    id = Math.floor(Math.random() * 10000)
    console.log('generateId(): ', id)
  }
  while(persons.find(p => p.id === id))

  return id
}
*/

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const data = request.body
  if (!data.name) {
    return response.status(400).json({
      error: 'missing name'
    })
  }
  else if (!data.number) {
    return response.status(400).json({
      error: 'missing number'
    })
  }

  const person = new Person({
    name: data.name,
    number: data.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = {
    number: request.body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/api/info', (request, response, next) => {
  Person.estimatedDocumentCount()
    .then(count => {
      response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.use((error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted request' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else if (error.name === 'MongoServerError') {
    switch (error.code) {
    case 11000:
      return response.status(400).json({ error: error.message })
    default:
      break
    }
  }

  next(error)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Phonebook server running on port ${PORT}`)
})