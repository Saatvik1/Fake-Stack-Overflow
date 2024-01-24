// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.

// Run this script to test your schema
// Start the mongoDB service as a background process before running the script
// Pass <username> <password> as the argument when running the script.
// Ensure that your URL of your mongoDB instance is: mongodb://127.0.0.1:27017/fake_so


let userArgs = process.argv.slice(2);

const bcrypt = require('bcrypt')
const saltRounds = 5

//console.log(userArgs)

// if (!userArgs[0].startsWith('mongodb')) {
//     console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
//     return
// }

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let Comments = require('./models/comments')
let Users = require('./models/users')


let mongoose = require('mongoose');
let mongoDB = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let tags = [];
let answers = [];
function tagCreate(name) {
  let tag = new Tag({ name: name });
  return tag.save();
}

function answerCreate(text, ans_by, ans_date_time, votes, comments) {
  answerdetail = { text: text };
  if (ans_by != false) answerdetail.ans_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;
  if (votes != false) answerdetail.votes = votes;
  if (comments != false) answerdetail.comments = comments;

  let answer = new Answer(answerdetail);
  return answer.save();
}

function questionCreate(title, text, tags, answers, asked_by, ask_date_time, views, summary, votes, comments) {
  qstndetail = {
    title: title,
    text: text,
    tags: tags,
    asked_by: asked_by
  }
  if (answers != false) qstndetail.answers = answers;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if (views != false) qstndetail.views = views;
  if (summary != false) qstndetail.summary = summary
  if (votes != false) qstndetail.votes = votes;
  if (comments != false) qstndetail.comments = comments;

  let qstn = new Question(qstndetail);
  return qstn.save();
}

function userCreate(username, password, acc_name, reputation, questions, admin, tags, answers) {
  userDetail = {
    username: username,
    password: password,
    accName: acc_name,
    admin: admin,
  }

  if (reputation !== false) {
    userDetail.reputation = reputation
  }

  if (questions !== false) {
    userDetail.questions = questions
  }

  if (tags !== false) {
    userDetail.tags = tags
  }

  if (answers !== false) {
    userDetail.answers = answers
  }

  let usr = new Users(userDetail)
  return usr.save()
}

function commentCreate(username, votes, text, comment_date) {
  commentDetail = {
    username: username,
    text: text,
  }

  if (votes != false) {
    commentDetail.votes = votes
  }
  if (comment_date != false) {
    commentDetail.comment_date = comment_date
  }

  let cmnt = new Comments(commentDetail)
  return cmnt.save()
}

const populate = async () => {

  const usernames = [userArgs[0], "joeshmo", "john doe"]

  let t1 = await tagCreate('react');
  let t2 = await tagCreate('javascript');
  let t3 = await tagCreate('android-studio');
  let t4 = await tagCreate('shared-preferences');
  let t5 = await tagCreate('dummy-tag');
  let t6 = await tagCreate('typescript');
  let t7 = await tagCreate('java');

  let c1 = await commentCreate(usernames[0], 10, 'Your question is stupid.', new Date()); // Any question
  let c2 = await commentCreate(usernames[0], 7, 'Your answer is stupid.', new Date('2022-03-17')) //These two comments will go on the same answer
  let c3 = await commentCreate(usernames[1], 0, 'Idk what I am commenting.', new Date('2023-08-23'))
  let c4 = await commentCreate(usernames[1], 18, 'Listen to lorna shore, theyr a great band... Trust me.', new Date('2023-08-23'))


  //text, ans_by, ans_date_time, votes, comments
  let a1 = await answerCreate(
    'React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.', 
    usernames[2], 
    false, 
    70, 
    false);

  let a2 = await answerCreate(
    'On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.',
    usernames[2],
    false, 
    29, 
    [c4]);

  let a3 = await answerCreate(
    'Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.', 
    usernames[0], 
    false, 
    19, 
    false);

  let a4 = await answerCreate(
    'YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);', 
    usernames[0], 
    false, 
    13, 
    false);

  let a5 = await answerCreate(
    'I just found all the above examples just too confusing, so I wrote my own. ',
    usernames[1], 
    false, 
    10, 
    [c2, c3]);

  //title, text, tags, answers, asked_by, ask_date_time, views, summary, votes, comments
  let q1 = await questionCreate(
    'Programmatically navigate using React router', 
    'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.', 
    [t1, t2], 
    [a1, a2], 
    usernames[0], 
    false, 
    false, 
    false, 
    48, 
    [c1]);

  let q2 = await questionCreate(
    'android studio save string shared preference, start activity and load the saved string', 
    'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.', 
    [t3, t4, t2], 
    [a3, a4, a5], 
    usernames[0], 
    false, 
    121, 
    false, 
    90, 
    [c1]);

  let q3 = await questionCreate(
    'Random Question', 
    'This is a random question.', 
    [t3, t4, t2], 
    [a3, a4, a5], 
    usernames[2], 
    false, 
    121, 
    false, 
    90, 
    [c1]);

  let q4 = await questionCreate(
    'Random Question 2', 
    'This is a random question 2.', 
    [t1], 
    [], 
    usernames[1], 
    false, 
    169, 
    false, 
    36, 
    [c1]);

  let q5 = await questionCreate(
    'Random Question 3', 
    'This is a random question 3.', 
    [t4], 
    [], 
    usernames[1], 
    false, 
    101, 
    false, 
    48, 
    [c1]);

  let q6 = await questionCreate(
    'Random Question 4', 
    'This is a random question 4.', 
    [t2], 
    [], 
    usernames[1], 
    false, 
    111, 
    false, 
    56, 
    [c1]);

  let q7 = await questionCreate(
    'Random Question 5', 
    'This is a random question 5.', 
    [t3], 
    [], 
    usernames[2],
    false, 
    152, 
    'This is a random question summary', 
    190, 
    [c1]);

  let adminPassword = undefined;
  let joeshmoPassword = undefined;
  let johnPassword = undefined;

  await bcrypt.hash(userArgs[1], saltRounds).then(function (hash) {
    adminPassword = hash
  })

  await bcrypt.hash('supersecret', saltRounds).then(function (hash) {
    joeshmoPassword = hash
  })

  await bcrypt.hash('supersecret2', saltRounds).then(function (hash) {
    johnPassword = hash;
  })

  let admin = await userCreate(usernames[0], adminPassword, 'yomama@gmail.com', 69, [q1, q2], true, [t1, t2, t6], [a3, a4])
  let joeshmo = await userCreate(usernames[1], joeshmoPassword, 'mybrainhurts@gmail.com', 7, [q4, q5, q6], false, [t3, t5], [a5])
  let john = await userCreate(usernames[2], johnPassword, 'johndoe@gmail.com', 123, [q3, q7], false, [t4, t7], [a1, a2])


  if (db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if (db) db.close();
  });

console.log('processing ...');

