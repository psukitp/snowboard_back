require('dotenv').config

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userController = require('./controller/user.controller')
const eventConroller = require('./controller/event.controller')
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middleware/error-middleware')
const { body } = require('express-validator')

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cookieParser())
const whiteList = ['http:/localhost:3000']
const corsOptions = {
    credentials: true,
    optionsSuccessStatus: 200,
    origin: true
}
app.use(cors(corsOptions));
app.use(fileUpload());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({
    type: ['application/json', 'text/plain']
}));
app.use(errorMiddleware)


//users
app.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 5, max: 30 }),
    userController.registration)
app.post('/login', userController.login)
app.post('/logout', userController.logout)
app.get('/activate/:link', userController.activate)
app.get('/refresh', userController.refresh)
app.get('/users', userController.getUsers)


//events
app.post('/new-event', eventConroller.createEvent)
app.get('/events', eventConroller.getEvents)

app.listen(PORT, () => console.log('server started on port ' + PORT))