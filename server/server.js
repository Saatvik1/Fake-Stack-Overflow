// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.


console.log("running server boew")

const bcrypt = require('bcrypt')
const saltRounds = 5
const express = require('express')
const app = express()
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
}

const port = 8000
var cors = require('cors')
var cookie = require('cookie-parser')
var session = require('express-session')


app.listen(port, () => {
    console.log("Listening on port"  + port)
})

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookie())
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge : 700000,
        secure : false,
        httpOnly: true,
    },
}))

// maxAge : 30000,


/* These are going to be the http requests from the fake_so database. */
let Questions = require('./models/questions');
let Answers = require('./models/answers');
let Tags = require('./models/tags');
let Comments = require('./models/comments')
let Users = require('./models/users')

/* User-specific HTTP Requests */
app.post('/user/verify_password', async (req, res) => {
    const password = req.query.password;
    const user = req.body;
    
    let result = false;
    await bcrypt.compare(password, user.password)
        .then(res => {
            result = res;
        })
    
    res.send(result);
})

//Need to add login HTTP Request
//When a user logs in, run this:        res.cookie(cookie_name(string), 'value'(object), {expire: 400000 + Date.now()});
//This adds a cookie to their session, with the user data as value, and a custome expiration date.

//Need to add logout HTTP Request'
//When user logs out, simply destroy the cookie:        res.clearCookie(cookieName);
app.post('/user/login', async (req, res) => {
    const user = req.body
    req.session.user = user
    res.send(req.session.user)
});

app.post('/user/logout', async (req, res) => {
    req.session.destroy()
    res.send("success")
})

app.get('/user/get_session', async (req, res) => {
    res.send(req.session.user)
})

/* When you delete a user, you have to delete everything associated with that user. */
app.post('/user/delete_account/:id', async (req, res) => {
    const userId = req.params.id;
    let userObj = await Users.findById(userId);
    userObj = userObj.toObject({ virtuals: true });
    await Users.deleteOne({ _id: userId })

    /* After deleting the user itself, delete the questions, answers, tags, and comments associated with them too. */
    for (const questionId of userObj.questions) {
        let questionObj = await Questions.findById(questionId);
        questionObj = await questionObj.toObject({ virtuals: true })
        await Questions.deleteOne({ _id: questionId });

        const commentIds = questionObj.comments;
        commentIds.forEach(commentId => {
            Comments.deleteOne({ _id: commentId });
        })

        let users = await Users.find({});
        users = users.map(user => user.toObject({ virtuals: true }))
        const answerIds = questionObj.answers;
        answerIds.forEach(answerId => {
            users.forEach(user => {
                if (user.answers.includes(answerId)) {
                    const answerIndex = user.answers.indexOf(answerId);
                    user.answers.splice(answerIndex, 1);
                }
                Users.findByIdAndUpdate(user._id, user, { new: true })
            })
            Answers.deleteOne({ _id: answerId });
        })
    }

    for (const answerId of userObj.answers) {
        await Answers.deleteOne({ _id: answerId })
    }

    for (const tagId of userObj.tags) {
        await Tags.deleteOne({ _id: tagId })
    }

    res.send(userObj)
})

// Note: Using the POST method is the best way to get the list of questions without relying on params.
app.post('/user/get_questions', async (req, res) => {
    let questionsList = []
    const questionIds = req.body;

    for (let i = 0; i < questionIds.length; i++) {
        const questionId = questionIds[i]
        const questionObj = await Questions.findById(questionId);
        questionsList.push(questionObj);
    }

    if (questionsList.length > 0)
        questionsList = questionsList.map((question) => question.toObject({ virtuals: true }));
    res.send(questionsList);
})

app.post('/user/get_tags', async (req, res) => {
    let tagsList = []
    const tagIds = req.body;

    for (let i = 0; i < tagIds.length; i++) {
        const tagId = tagIds[i];
        const tagObj = await Tags.findById(tagId);
        tagsList.push(tagObj);
    }

    if (tagsList.length > 0)
        tagsList = tagsList.map((tag) => tag.toObject({ virtuals: true }))
    res.send(tagsList);
})

/* Question-specific HTTP Requests */
app.post('/question/get_tags', async (req, res) => {
    let tagsList = []
    const tagIds = req.body;

    for (let i = 0; i < tagIds.length; i++) {
        const tagId = tagIds[i]
        const tagObj = await Tags.findById(tagId);
        tagsList.push(tagObj);
    }

    if (tagsList.length > 0)
        tagsList = tagsList.map((tag) => tag.toObject({ virtuals: true }));
    res.send(tagsList);
})

app.post('/question/delete_post/:id', async (req, res) => {
    const questionId = req.params.id;
    let questionObj = await Questions.findById(questionId);
    questionObj = await questionObj.toObject({ virtuals: true })
    await Questions.deleteOne({ _id: questionId });

    /* Make sure to delete the question id from the logged user's list. */
    const loggedUser = req.body;
    const questionIndex = await loggedUser.questions.indexOf(questionId);
    await loggedUser.questions.splice(questionIndex, 1);
    await Users.findByIdAndUpdate(loggedUser._id, loggedUser, { new: true })

    /* After the question has been deleted, the answers and comments should be deleted too. */
    const commentIds = questionObj.comments;
    commentIds.forEach(commentId => {
        Comments.deleteOne({ _id: commentId });
    })

    let users = await Users.find({});
    users = users.map(user => user.toObject({ virtuals: true }))
    const answerIds = questionObj.answers;
    answerIds.forEach(answerId => {
        users.forEach(user => {
            if (user.answers.includes(answerId)) {
                const answerIndex = user.answers.indexOf(answerId);
                user.answers.splice(answerIndex, 1);
            }
            Users.findByIdAndUpdate(user._id, user, { new: true })
        })
        Answers.deleteOne({ _id: answerId });
    })

    res.send({updatedUser: loggedUser, deletedQuestion: questionObj});
})

/* Tag-specific HTTP Requests */
app.post('/tag/delete_tag/:id', async (req, res) => {
    const tagId = req.params.id;
    let tagObj = await Tags.findById(tagId);
    tagObj = await tagObj.toObject({ virtuals: true })
    await Tags.deleteOne({ _id: tagId });

    /* Make sure to delete the tag id from the logged user's list. */
    const loggedUser = req.body;
    const tagIndex = loggedUser.tags.indexOf(tagId);
    loggedUser.tags.splice(tagIndex, 1);
    await Users.findByIdAndUpdate(loggedUser._id, loggedUser, { new: true })

    /* Make sure to also delete the tag from the logged user's questions as well. */
    const questionIds = loggedUser.questions;
    for (const questionId of questionIds) {
        let questionObj = await Questions.findById(questionId);
        questionObj = questionObj.toObject({ virtuals: true });
        const tagIndex = questionObj.tags.indexOf(tagId);

        if (tagIndex >= 0) {
            questionObj.tags.splice(tagIndex, 1);
            await Questions.findByIdAndUpdate(questionId, questionObj, { new: true })
        }
    }

    res.send({updatedUser: loggedUser, deletedtag: tagObj});
})

/** General HTTP Requests **/
/* Getter HTTP Requests */
app.get('/get/:modelsType', async (req, res) => {
    const modelsRequest = req.params.modelsType;
    let models = undefined;
    switch(modelsRequest) {
        case 'questions':
            models = await Questions.find({});
            break;
        case 'answers':
            models = await Answers.find({});
            break;
        case 'tags':
            models = await Tags.find({});
            break;
		case 'comments':
			models = await Comments.find({});
			break;
		case 'users':
			models = await Users.find({});
			break;
        default:
            throw new Error('Invalid model type');
    }
    models = models.map((model) => model.toObject({ virtuals: true }))
    res.send(models);
})

app.get('/get/:modelType/:id', async (req, res) => {
    const modelRequest = req.params.modelType;
    const id = req.params.id;
    let model = undefined;
    switch(modelRequest) {
        case 'question':
            model = await Questions.findById(id)
            break;
        case 'answer':
            model = await Answers.findById(id)
            break;
        case 'tag':
            model = await Tags.findById(id)
            break;
        case 'comment':
            model = await Comments.findById(id)
            break;
        case 'user':
            model = await Users.findById(id)
            break;
        default:
            throw new Error('Invalid model type');
    }
    if(model)
        model = await model.toObject({ virtuals: true });

    //console.log(model) 
    res.send(model);
})

/* Note: In order to get this GET HTTP request to work, you have to set the url to something like this:
 * http://localhost:8000/get_by_fields/tag?property1=value1&property2=value2&...
 *
 * Additionally, if you have values that have special characters, such as '+', make sure to encode the property
 * with encodeURIComponent.
 */

app.get('/get_by_fields/:modelType', async (req, res) => {
    const modelRequest = req.params.modelType;
    const queryParams = req.query;
    const modelFields = {}
    for(const key in queryParams)
        modelFields[key] = queryParams[key];

    let model = undefined;
    switch(modelRequest) {
        case 'question':
            model = await Questions.findOne(modelFields)
            break;
        case 'answer':
            model = await Answers.findOne(modelFields)
            break;
        case 'tag':
            model = await Tags.findOne(modelFields)
            break;
        case 'comment':
            model = await Comments.findOne(modelFields)
            break;
        case 'user':
            model = await Users.findOne(modelFields)
            break;
        default:
            throw new Error('Invalid model type');
    }
    if(model)
        model = await model.toObject({ virtuals: true });
    //console.log(model)
    res.send(model);
})

/* HTTP Request for updating particular objects for models. */
app.put('/update/:modelType/:id', async (req, res) => {
    const modelRequest = req.params.modelType;
    let modelId = req.params.id;
    let updatedData = req.body;

    let Models;
    switch(modelRequest) {
        case 'question':
            Models = Questions;        
            break;
        case 'answer':
            Models = Answers;
            break;
        case 'tag':
            Models = Tags;
            break;
        case 'comment':
            Models = Comments;
            break;
        case 'user':
            Models = Users;
            break;
        default:
            throw new Error('Invalid model type');
    }

    await Models.findByIdAndUpdate(modelId, updatedData, { new: true })
        .then(updatedModel => {
            if(!updatedModel)
                return res.status(404).send({ error: `No model with id ${modelId} found.` });
            updatedModel = updatedModel.toObject( {virtuals: true} );
            //console.log(updatedModel)
            //console.log(req.session.user)
            res.send(updatedModel);
        })
        .catch(err => {
            res.status(500).send({ error: 'Server error' });
        });
        
})

/* HTTP Request for adding a particular object to one of the database models. */
app.post('/create_model/:modelType', async (req, res) => {
    const modelRequest = req.params.modelType;
    const modelToAdd = req.body;

    /* Note: When adding a new model, the object properties are already set by the client. */
    let newModel;
    switch(modelRequest) {
        case 'question':
            newModel = await Questions(modelToAdd);
            break;
        case 'answer': 
            newModel = await Answers(modelToAdd);
            break;
        case 'tag':
            newModel = await Tags(modelToAdd);
            break;
        case 'comment':
            newModel = await Comments(modelToAdd);
            break;
        case 'user':
            await bcrypt.hash(modelToAdd.password, saltRounds).then(function(hash){
                modelToAdd.password = hash
                newModel = Users(modelToAdd);
            })            
            break;
        default:
            throw new Error('Invalid model type');
    }
    await newModel.save();
    newModel = await newModel.toObject({ virtuals: true });
    //console.log(newModel)
    res.send(newModel);
})

var mongoose = require('mongoose')
const comments = require('./models/comments')

var mongoDBAddress = 'mongodb://127.0.0.1:27017/fake_so'
mongoose.connect(mongoDBAddress)

var dbConnection = mongoose.connection

dbConnection.on('error', console.error.bind(console, 'MongoDB failed to connect'))

dbConnection.on('connected', function() {
    console.log("successfully connected to database");
})


process.on('SIGINT', async () => {
    hasError = false;
    if(dbConnection) {
        const closingMsg = "Server closed. Database instance disconnected.";
        await dbConnection.close()
            .then(res => {
                console.log(closingMsg);
            })
            .catch(err => {
                console.error(err);
                hasError = true;
            })
    }
    console.log("Process terminated.")
    process.exit(hasError ? 1 : 0);
})
