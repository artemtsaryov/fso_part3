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

const generateId = () => {
  
  let id
  do {
    id = Math.floor(Math.random() * 10000)
    console.log('generateId(): ', id)
  }
  while(persons.find(p => p.id === id))

  return id
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.post('/api/persons', (request, response) => {
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

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  persons = persons.filter(p => p.id !== Number(request.params.id))
  response.status(204).end()
})

app.get('/api/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Phonebook server running on port ${PORT}`)
})