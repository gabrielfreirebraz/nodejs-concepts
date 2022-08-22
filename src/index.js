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



  const isUserExists = users.find( (elem, idx, arr) => {

    return (request.body.username === elem.username);
  });

  if (!!isUserExists) {

    return response.status(400).json( {error: "This user already exists! Please try again..."} );
  }



  let myReq = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: []
  }

  users.push(myReq);

  return response.status(201).json( myReq );
});





 /************* GET TODOS LIST ************/
app.get('/todos', checksExistsUserAccount, (request, response) => {


  return response.status(200).json( request.currentUser.todos );
});




 /************* CREATE NEW TODO ************/
app.post('/todos', checksExistsUserAccount, (request, response) => {

  const newTodo = { 
    id: uuidv4(),
    title: request.body.title,
    done: false, 
    deadline: new Date(request.body.deadline), 
    created_at: new Date()
  }

  if (!newTodo.title) {
    throw ("Invalid title to this request")
  }


  const current_index = users.indexOf(request.currentUser);
  users[current_index].todos.push(newTodo)
  request.currentUser = users[current_index];

  return response.status(201).json( newTodo );
});






 /************* UPDATE TODO BY KEY ************/
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const curr_idx = users.indexOf(request.currentUser);
  const todo_obj_request = users[curr_idx].todos.find((elem) => {

    return request.params.id === elem.id;
  })

  if (!todo_obj_request) return response.status(404).json({error:'Todo not found'})


  const curr_idx_todo = users[curr_idx].todos.indexOf(todo_obj_request);

  users[curr_idx].todos[curr_idx_todo].title = request.body.title;
  users[curr_idx].todos[curr_idx_todo].deadline = new Date( request.body.deadline );
  
  request.currentUser = users[curr_idx];

  const todoUpdated =  request.currentUser.todos[curr_idx_todo];

  return response.status(201).json( todoUpdated );
});







 /************* UPDATE FOR TRUE IN TODO ************/
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const todoDone = request.currentUser.todos.find((element, idx, arr) => {
    if (element.id === request.params.id) {

      element.done = true;        

      return true;
    }

    return false;
  });

  if (!todoDone) {
    return response.status(404).json({error:"Todo not found for to make done!"})
  }

  const idxCurrUser = users.indexOf(request.currentUser);
  users[idxCurrUser] = request.currentUser;

  // console.log(users[idxCurrUser]);

  return response.status(200).json( todoDone );
});





 /************* DELETE TODO BY ID ************/
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const todoDeleted = request.currentUser.todos.find((elem, idx, arr) => {

    if (elem.id === request.params.id) {
      request.currentUser.todos.splice(idx, 1);
      return true;
    }
    return false;
  });


  if (!todoDeleted) {
    return response.status(404).json({error: "Todo not found for deleted it!"})
  }

  const idxCurrUser = users.indexOf(request.currentUser);
  users[idxCurrUser] = request.currentUser;

  return response.status(204).json( request.currentUser );
});




module.exports = app;