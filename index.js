require('dotenv').config
const db = require('./db')


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userController = require('./controller/user.controller')
const eventConroller = require('./controller/event.controller')
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middleware/error-middleware')
const { body } = require('express-validator');
const commentController = require('./controller/comment.controller');
const resalesController = require('./controller/resales.controller');

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
app.post('/refresh', userController.refresh)
app.get('/users', userController.getUsers)
app.post('/users/:id', userController.updateUser)
app.post('/users/new-photo/:id', userController.updateUserPhoto)


//events
app.post('/new-event', eventConroller.createEvent)
app.get('/events', eventConroller.getEvents)
app.get('/events/:id', eventConroller.getOneEvent)
app.post('/events/update/:id', eventConroller.updateEvent)
app.get('/events-statistic', eventConroller.getDateStatisticEvent)
app.get('/events/delete/:id', eventConroller.deleteEvent)
app.get('/my-events/:id', eventConroller.getMyEvents)


//comments
app.post('/create-new-comment', commentController.addCommentToEvent)
app.get('/comments/:event_id', commentController.getComments)
app.get('/comment-statistic', commentController.getDateStatisticComment)



//resales
app.get('/resales', resalesController.getResales)
app.post('/new-resale', resalesController.createResale)
app.get('/products', resalesController.getProductTypes)
app.get('/resale/:id', resalesController.getOneResale)
app.post('/resale/update/:id', resalesController.updateResale)
app.get('/my-resales/:id', resalesController.getMyResales)



let server = app.listen(PORT, () => console.log('server started on port ' + PORT))

//messages
const messageController = require('./controller/message.controller');
app.post('/get-senders', messageController.getSenders)
app.post('/get-history', messageController.getHistory)

var iosocket = require('socket.io');
let io = iosocket(server, {
    cors: {
        origin: "*"
    }
});
io.on('connection', (socket) => {
    socket.on('join', async ({ user, creator }) => {
        try {
            await socket.join(creator);
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('sendMessage', async ({ message, user, creator, recipient }) => {
        try {
            const chat = await db.query(`SELECT chat_id FROM chat WHERE creator_id=${creator} and user_id =${recipient}`);
            const newMessage = await db.query(`INSERT INTO message (sender_id, message) values ($1, $2)`, [user, message]);
            const lastValue = await db.query(`SELECT * FROM message WHERE message_id = (SELECT max(message_id) FROM message)`)
            await db.query(`INSERT INTO chat_message_con (chat_id, message_id) values ($1, $2)`, [chat.rows[0].chat_id, lastValue.rows[0].message_id])
            io.to(creator).emit('message', {
                data: {
                    user: user,
                    message: message
                }
            })
        } catch (e) {
            console.log(e)
        }
    })


    io.on('disconnect', () => {
        socket.disconnect(0);
    })
})