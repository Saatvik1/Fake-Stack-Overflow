[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/9NDadFFr)
Add design docs in *images/*

## Instructions to setup and run project
- To populate data, make sure mongodb server is running on              mongodb://127.0.0.1:27017/fake_so
- To run init, insert into the console, where < username> and < password> is up to you: nodemon server/init.js < username> < password>
- Make sure to use npm install in both the client and server directories to get the appropriate npm packages.
- Note: In the initialized database, there's 2 other users (excluding the admin) with the following emails and passwords:
    - mybrainhurts@gmail.com, supersecret
    - johndoe@gmail.com, supersecret2
- Here's the admin email as well: yomama@gmail.com

## Team Member 1 Contribution
James Nanas
- In charge of planning the front-end design of the Fake Stack Overflow website.
- Front-end stuff:
    - Implemented the front-end design for the "Welcome Page"
    - Implemented the user registration portion of the "Welcome Page".
    - Implemented the "Login Page" and the login feature.
    - Implemented the refreshing of the home page when the user is logged in.
    - Added the "Continue as Guest" button functionality.
    - Added the "Log Out" button.
    - Adding the "Prev" and "Next" buttons in home page for displaying questions.
    - In charge of designing the "User Profile Page" and its functionalities.
    - Revamped the "Ask Question Page" to meet the new requirements.
    - Implementing the editing function for the "Ask Question Page"
    - Fixed constant looping of componentDidUpdate() in "Fake Stack Overflow" component.
    - Finished implementing the editMode version of "Ask Question Page".
    - Implemented the deletion of users from the admin.
- Back-end stuff:
    - Added the Users and Comments schemas to the http requests in server.js
    - Added a user-specific http request that checks the password of a login is correct using bcrypt.
    - Added many user-specific, question-specific, and tag-specific http requests.
    - Fixed up init to hash passwords as well.

## Team Member 2 Contribution
Saatvik Sandal
- Created the UML Diagram
- Added User schema and Comment schema to DB.
- Created init.js functionality and test data.
- Added hashing functionality to server.js when registering a new user.
- (Half) added cookie ability
- Updated init to hash passwords before creating it.
- Added express-session functionality, and user information storage in cookie.
- Added prev/next button functionality to all pages
- Finished adding it to schema, finished functionality where it gets added during add question/answer form 
- Added component to question items
- Created comment component and added comment functionality to answers and questions, and upvote functionality.
- Added voting and reputation functionality entirely
- Separated functionalities for guest and logged-in users across all options

## To-do List
### James Nanas
- Create the following pages:
    - "User Profile Page" (for regular user)
        - Add the following user displays:
            - User Answers
    - "User Profile Page" (for admin)
        - Display all users in the system.
- Existing pages to work on:
    - "Home Page"
        - Add the number of votes on each question displayed in home page.
        - (OPTIONAL) Fix graphical glitch on search as well.
    - "Tags Page"
        - (OPTIONAL) Fix graphical glitch on displaying questions associated with a tag.
    - "Answers Page"
        - Fix graphical glitches
        - Display the set of tags in the answer page as well.

## Additional Notes
Added use cases : 1, 2, 3, 4, 5, 6, 7, 8, 13

### Things to do for 316: 
- Fix next button to complete roundtrip
- Add changes to (tags and answers in users) init.js and the diagram
- Add votes to question (and any other missing details here ------>   For each question in the list it displays, the question title, question summary, the list of associated tags, the no. of times it has been viewed and voted, the no. of answers it has, the username of the questioner and the date it was posted.)
- Need to add the number of votes to answer (use case 9) (use case 10)
- Both registered/guest: Need to add comments to question in the answer page (link of question clicked) (use case 9) (use case 11 and 12 (depends on if logged in))
- Both registered/guest: Need to add next/prev buttons for answers in answer page (5 answers at a time, next button does roundtrip) (use case 9)

- For guest: remove option to add new answer in answer page and make sure they dont have option of upvote or downvote. (use case 9)
- For registered: New answer button (done) and add following:  (use case 10)
    - The question and each answer has options to upvote and downvote the question or answer. Upvoting increases the vote by 1 and downvoting decreases the vote by 1. Upvoting a question/answer increases the reputation of the corresponding user by 5. Downvoting a question/answer decreases the reputation of the corresponding user by 10. A user can vote if their reputation is 50 or higher 
- For guest: Add comments to answers and questions (use case 11) 
- For registered: Add comments to answers and questions but with options when logged in. (use case 12)
- User profile: Use case 14 and 15 depending on admin or not.






Live edits for Saatvik: DONE MINUS guest functionality
UNFINISHED --

Still need to make it so that if the user is a guest one they cant use the buttons. 
start on the upvote for answers and questions - reputation system
