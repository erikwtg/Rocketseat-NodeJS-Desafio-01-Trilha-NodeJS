const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { json } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({error: 'Not found!'})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;

  const userAlreadyExist = users.some(user => user.username === username);

  if (userAlreadyExist) {
    return response.status(400).json({error: 'User already exist!'})
  }

  const id = uuidv4();

  const user = { 
    id, // precisa ser um uuid
    name, 
    username, 
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { todos } = request.user;
  return response.status(201).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {
    title,
    deadline
  } = request.body;

  const id = uuidv4();

  const todo = { 
    id, // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;
  const {
    title,
    deadline
  } = request.body;

  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: 'Todo not exist!'})
  }

  Object.assign(todo, {title, deadline});

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: 'Todo not exist!'});
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(item => item.id === id);

  if (!todo) {
    return response.status(404).json({error: 'Not exist!'});
  }

  user.todos.splice(todo, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;