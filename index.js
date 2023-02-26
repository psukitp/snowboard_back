const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userController = require('./controller/user.controller')
const eventConroller = require('./controller/event.controller')

const port = 3001;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({
    type: ['application/json', 'text/plain']
}));


//users
app.post('/new-user', userController.createUser)
app.get('/users', userController.getUsers)


//events
app.post('/new-event', eventConroller.createEvent)
app.get('/events', eventConroller.getEvents)

app.listen(port, () => console.log('server started on port ' + port))