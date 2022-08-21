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




/************* CREATE USERS ************/
app.post('/users', (request, response) => {


  let myReq = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: []
  }

  users.push(myReq);

  return response.status(200).json( users );
});





 /************* GET TODOS LIST ************/
app.get('/todos', checksExistsUserAccount, (request, response) => {


  return response.status(200).json( request.currentUser.todos );
});




 /************* CREATE NEW TODO ************/
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






 /************* UPDATE TODO BY KEY ************/
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const curr_idx = users.indexOf(request.currentUser);
  const todo_obj_request = users[curr_idx].todos.find((elem) => {

    return request.params.id === elem.id;
  })

  const curr_idx_todo = users[curr_idx].todos.indexOf(todo_obj_request);

  users[curr_idx].todos[curr_idx_todo].title = request.body.title;
  users[curr_idx].todos[curr_idx_todo].deadline = new Date( request.body.deadline );
  
  request.currentUser = users[curr_idx];

  return response.status(200).json( request.currentUser );
});







 /************* UPDATE FOR TRUE IN TODO ************/
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {


  request.currentUser.todos.find((element, idx, arr) => {
    if (element.id === request.params.id) {

      element.done = true;  
      
      return true;
    }

    return false;
  });

  const idxCurrUser = users.indexOf(request.currentUser);
  users[idxCurrUser] = request.currentUser;

  // console.log(users[idxCurrUser]);

  return response.status(200).json( request.currentUser );
});





 /************* DELETE TODO BY ID ************/
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  request.currentUser.todos.find((elem, idx, arr) => {

    if (elem.id === request.params.id) {
      request.currentUser.todos.splice(idx, 1);
      return true;
    }
    return false;
  });

  const idxCurrUser = users.indexOf(request.currentUser);
  users[idxCurrUser] = request.currentUser;

  return response.status(200).json( request.currentUser );
});




module.exports = app;