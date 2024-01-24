import "../stylesheets/add_answer_page.css";
import axios from "axios";
import React from "react";
import { hasValidHyperlink } from "../utilities/hyperlink_helper_functions";
import { removeErrorTexts, displayErrorText } from "../utilities/display_error_functions"

export default class AddAnswerPage extends React.Component {
    constructor(props){
        super(props)
        this.addAnswerFormEvent = this.addAnswerFormEvent.bind(this)
    }

    async addAnswerFormEvent(event){
        event.preventDefault();

        /* Access form data */
        const answerText = await document.getElementById("answer-text-input").value;
        const username = await document.getElementById("username-input").value;

        /* This is for testing purposes. */
       
        console.log("answerText: " + answerText);
        console.log("username: " + username);

        /* Verify data here. */
        removeErrorTexts();
        let hasError = verifyInputs(answerText, username);
        if(hasError) {
            const newAnswerForm = document.getElementById("new-answer-form");
            newAnswerForm.reset();
            return;
        }

        /* Process the data and add these fields to to the model. */
        const newAnswer = {
            text: answerText,
            ans_by: this.props.UserManager.user.username,
            ans_date_time: new Date(),
            userID : this.props.UserManager.user._id
        };

        console.log(this.props.qanswers)

        const response = await axios.post('http://localhost:8000/create_model/answer', newAnswer);
            
        let newAnswers = this.props.qanswers
        await newAnswers.unshift(response.data._id)
        

        await axios.put(`http://localhost:8000/update/question/${this.props.qid}`, { answers: newAnswers })
            .then(res => {
                console.log("Successful add answer to question");
                console.log("Answer with id = \"" + res.data._id + "\" was successfully added.");
                this.props.UserManager.user.answers.push(res.data._id)
                //console.log(this.props.UserManager.user.answers)
                axios.put(`http://localhost:8000/update/user/${this.props.UserManager.user._id}`, {answers : this.props.UserManager.user.answers})

            })
            .catch(err => {
                console.log(this.props.qanswers)
                console.log("Unsuccessful add answer to question" + err);
            })

        
            
        this.props.PageManager.updatePage("home page");
    }

    render(){
        return (
            <div className = "add-answer-page">
                <form id = "new-answer-form" action="/submit" onSubmit = {this.addAnswerFormEvent} method = "post">
                    <UsernameField />
                    <AnswerTextField />
                    <p className="star-indicator">* indicates mandatory fields.</p>
                    <input type="submit" id="post-button-answer" value={"Post Answer"}></input>
                </form>
            </div>
        )
    }
}

function AnswerTextField() {
    return (
        <div>
            <h1>Answer Text*</h1>
            <textarea rows={4} cols={50} id="answer-text-input"></textarea>
        </div>
    );
}


function UsernameField() {
    return (
        <div>
            <h1>Username*</h1>
            <input type="text" id="username-input"></input>
        </div>
    );
}

/* Helper functions for submitting a new question. */
function verifyInputs(answerText, username) {
    let hasError = false;

    if(answerText.length < 1) {
        hasError = true;
        const errorMsg = "The answer text is empty.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "answer-text-input");
    } 

    //Check if there is a string enclosed in [], then there should be a () with https:// or http://
    if(!hasValidHyperlink(answerText)){
        hasError = true;
        const errorMsg = "One or more hyperlinks in the text are invalid.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "answer-text-input");
    }

    if(username.length < 1) {
        hasError = true;
        const errorMsg = "The username is empty.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "username-input");
    }


    return hasError;
}