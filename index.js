console.log('Phonebook server is about to start...')

const express = require('express')
const app = express()

app.use(express.json())

const morgan = require('morgan')

morgan.token('body', function (req, res) { 
  return req.method === 'POST' ? JSON.stringify(req.body) : '' 
})

app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

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
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {

  const person = persons.find(p => p.id === Number(request.params.id))
  if (person) {
    response.json(person)
  }
  else {
    response.status(404).end()
  }
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
  else if (persons.find(p => p.name === data.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: data.name,
    number: data.number
  }

  persons = persons.concat(person)

  response.json(person)
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