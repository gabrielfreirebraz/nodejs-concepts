const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const usernameRequest = request.headers.username;
  const isUserExists = users.find(function(elem){

    return elem.username === usernameRequest;
  });


  if ( !isUserExists ) {
    return response.status(400).json( {errorMessage: "User not found, please try again!"} );
  }
  else {

    request.currentUser = isUserExists;
    return next();
  }  
}





app.post('/users', (request, response) => {


  let myReq = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: []
  }

  users.push(myReq)

  return response.status(200).json( users );
});



 
app.get('/todos', checksExistsUserAccount, (request, response) => {


  return response.status(200).json( request.currentUser.todos );
});


app.post('/todos', checksExistsUserAccount, (request, response) => {

  const reqTodo = { 
    id: uuidv4(),
    title: request.body.title,
    done: false, 
    deadline: new Date(request.body.deadline), 
    created_at: new Date()
  }

  if (!reqTodo.title) {
    throw ("Invalid title to this request")
  }

  const current_index = users.indexOf(request.currentUser);
  users[current_index].todos.push(reqTodo)
  request.currentUser = users[current_index];

  return response.status(200).json( request.currentUser.todos );
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;