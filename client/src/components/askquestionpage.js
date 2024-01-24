import "../stylesheets/ask_question.css";

import React from "react";
import axios from "axios";
import { hasValidHyperlink } from "../utilities/hyperlink_helper_functions";
import { removeErrorTexts, displayErrorText } from "../utilities/display_error_functions"

export default class AskQuestionPage extends React.Component {
    constructor(props) {
        super(props)
        this.askQuestionFormEvent = this.askQuestionFormEvent.bind(this);
        this.deleteQuestion = this.deleteQuestion.bind(this);
    }

    /* Imported this method from homework 1 with a few adjustments. */
    async askQuestionFormEvent(event) {
        await event.preventDefault();

        /* Access form data */
        const questionTitle = await document.getElementById("question-title-input").value;
        const questionSummary = await document.getElementById("question-summary-input").value;
        const questionText = await document.getElementById("question-text-input").value;
        const tags = await document.getElementById("tags-input").value;

        /* This is for testing purposes. */
        console.log("questionTitle: " + questionTitle);
        console.log("questionSummary: " + questionSummary);
        console.log("questionText: " + questionText);
        console.log("tags: " + tags);

        /* Verify data here. */
        removeErrorTexts();
        let hasError = await verifyInputs(questionTitle, questionSummary, questionText, tags, this.props.UserManager.user);
        if(hasError) {
            const newQuestionForm = document.getElementById("new-question-form");
            newQuestionForm.reset();
            return;
        }

        /* Process the data and add these fields to to the model. */
        const tagIdSet = new Set([])

        /* Add tagIds */
        const tagsArr = await tags.split(" ").map((tag) => tag.toLowerCase());

        for(const tag of tagsArr) {
            const tagObj = await searchTag(tag)
            tagIdSet.add(tagObj._id);
        }

        const tagIds = [];
        tagIdSet.forEach((tagId) => tagIds.push(tagId));

        let newQuestion;
        if (this.props.editMode === 1) {
            newQuestion = {
                title: questionTitle,
                text: questionText,
                answers: this.props.question.answers,
                tags: tagIds,
                asked_by: this.props.UserManager.user.username,
                userID: this.props.UserManager.user._id,
                ask_date_time: this.props.question.ask_date_time,
                comments: this.props.question.comments,
                summary: questionSummary ? questionSummary : ""
            }
        } else {
            newQuestion = {
                title: questionTitle,
                text: questionText,
                answers: [],
                tags: tagIds,
                asked_by: this.props.UserManager.user.username,
                userID: this.props.UserManager.user._id,
                ask_date_time: new Date(),
                comments: [],
                summary: questionSummary ? questionSummary : ""
            };
        }

        if (this.props.editMode === 1) {
            await axios.put(`http://localhost:8000/update/question/${this.props.question._id}`, newQuestion)
                .then(async res => {
                    console.log("Question with id = \"" + res.data._id + "\" was successfully modified.")

                    /* Updates the user with tags that they have created. */
                    let newUniqueTagList = []
                    await res.data.tags.forEach((tagId) => {
                        if (!this.props.UserManager.user.tags.includes(tagId)) {
                            newUniqueTagList.push(tagId)
                        }
                    })

                    /* Obtain all users and check each of their tags lists to see if there's a match for a tag in unique list.
                     * If that's the case, remove that tag from the unique tag list.
                     */
                    let allUsers;
                    let success = true;
                    await axios.get("http://localhost:8000/get/users/")
                        .then(res => {
                            allUsers = res.data;
                        })
                        .catch(err => {
                            console.log(err)
                            window.alert(`The server could not update the question. Please try again. ${err}`)
                            success = false;
                        })

                    if (!success) {
                        const newQuestionForm = document.getElementById("new-question-form");
                        newQuestionForm.reset();
                        return;
                    }

                    allUsers = allUsers.filter((user => user._id !== this.props.UserManager.user._id));
                    await allUsers.forEach(user => {
                        const userTags = user.tags;
                        userTags.forEach(tagId => {
                            if (newUniqueTagList.includes(tagId)) {
                                const index = newUniqueTagList.indexOf(tagId);
                                newUniqueTagList.splice(index, 1);
                            }
                        })
                    })

                    if (newUniqueTagList.length !== 0)
                        this.props.UserManager.user.tags = [...this.props.UserManager.user.tags, ...newUniqueTagList]

                    await axios.put(`http://localhost:8000/update/user/${this.props.UserManager.user._id}`, { tags: this.props.UserManager.user.tags })
                })
                .catch(err => {
                    console.log(err);
                    window.alert(`The server could not update this question. Please try again later! ${err}`)
                    const newQuestionForm = document.getElementById("new-question-form");
                    newQuestionForm.reset();
                    return;
                })

            this.props.PageManager.updatePage("user profile page")
        } else {
            await axios.post('http://localhost:8000/create_model/question', newQuestion)
                .then(async res => {
                    console.log("Question with id = \"" + res.data._id + "\" was successfully created.")

                    /* Updates the user with tags that they have created. */
                    let newUniqueTagList = []
                    await res.data.tags.forEach((tagId) => {
                        if (!this.props.UserManager.user.tags.includes(tagId)) {
                            newUniqueTagList.push(tagId)
                        }
                    })

                    /* Obtain all users and check each of their tags lists to see if there's a match for a tag in unique list.
                     * If that's the case, remove that tag from the unique tag list.
                     */
                    let allUsers;
                    let success = true;
                    await axios.get("http://localhost:8000/get/users/")
                        .then(res => {
                            allUsers = res.data;
                        })
                        .catch(err => {
                            console.log(err)
                            window.alert(`The server could not create the question. Please try again. ${err}`)
                            success = false;
                        })

                    if (!success) {
                        const newQuestionForm = document.getElementById("new-question-form");
                        newQuestionForm.reset();
                        return;
                    }

                    allUsers = allUsers.filter((user => user._id !== this.props.UserManager.user._id));
                    await allUsers.forEach(user => {
                        const userTags = user.tags;
                        userTags.forEach(tagId => {
                            if (newUniqueTagList.includes(tagId)) {
                                const index = newUniqueTagList.indexOf(tagId);
                                newUniqueTagList.splice(index, 1);
                            }
                        })
                    })

                    if (newUniqueTagList.length !== 0)
                        this.props.UserManager.user.tags = [...this.props.UserManager.user.tags, ...newUniqueTagList]

                    const questionIds = [...this.props.UserManager.user.questions, res.data._id];
                    const loggedUser = this.props.UserManager.user;
                    loggedUser.questions.push(res.data._id)

                    await axios.put(
                        `http://localhost:8000/update/user/${this.props.UserManager.user._id}`, 
                        { 
                            tags: this.props.UserManager.user.tags,
                            questions: questionIds
                        }
                    )
                    await this.props.UserManager.updateUser(loggedUser)
                })
                .catch(err => {
                    console.log(err);
                    window.alert(`The server could not post this question. Please try again later! ${err}`)
                    const newQuestionForm = document.getElementById("new-question-form");
                    newQuestionForm.reset();
                    return;
                });

            this.props.PageManager.updatePage("home page");
        }
    };

    async deleteQuestion() {
        console.log(`Deleting question with id = ${this.props.question._id}`)
        
        let success = false;
        let updatedUser;
        await axios.post(`http://localhost:8000/question/delete_post/${this.props.question._id}`, this.props.UserManager.user)
            .then(res => {
                console.log(`The question with id = ${res.data.deletedQuestion._id} has been deleted.`);
                success = true;
                updatedUser = res.data.updatedUser;
            })
            .catch(err => {
                console.error(err);
                window.alert(`This question could not be deleted by the server. Please try again. \n${err}`)
                success = false;
            })
        if (success) {
            await this.props.UserManager.updateUser(updatedUser)
            this.props.PageManager.updatePage("user profile page")
        }
    }

    render() {
        /* If editMode is on, all of the fields would be filled with the existing question's fields for each. 
         * Additionally, there would be two buttons, one for modifying the existing question and another for
         * deleting the question entirely. The user will be sent back to the user page afterwards after deletion. 
         */
        if (this.props.editMode === 1) {
            console.log(`Editing question with id = ${this.props.question._id}`)
            return (
                <div className="ask-question-page">
                    <form id="new-question-form" action="/submit" onSubmit={this.askQuestionFormEvent} method="post">
                        <QuestionTitleField editMode={this.props.editMode} question={this.props.question} />
                        <QuestionSummaryField editMode={this.props.editMode} question={this.props.question} />
                        <QuestionTextField editMode={this.props.editMode} question={this.props.question} />
                        <QuestionTagsField editMode={this.props.editMode} question={this.props.question} />
                        <p className="star-indicator">* indicates mandatory fields.</p>
                        <input type="submit" id="post-button" value={"Modify Question"}></input>
                    </form>
                    <button onClick={this.deleteQuestion}>Delete Question</button>
                </div>
            );
        } else {
            return (
                <div className="ask-question-page">
                    <form id="new-question-form" action="/submit" onSubmit={this.askQuestionFormEvent} method="post">
                        <QuestionTitleField editMode={this.props.editMode} question={this.props.question} />
                        <QuestionSummaryField editMode={this.props.editMode} question={this.props.question} />
                        <QuestionTextField editMode={this.props.editMode} question={this.props.question} />
                        <QuestionTagsField editMode={this.props.editMode} question={this.props.question} />
                        <p className="star-indicator">* indicates mandatory fields.</p>
                        <input type="submit" id="post-button" value={"Post Question"}></input>
                    </form>
                </div>
            );
        }
    };
};



function QuestionTitleField(props) {
    if (props.editMode === 1) {
        return (
            <div>
                <h1>Question Title*</h1>
                <p>Limit title to 50 characters or less.</p>
                <input type="text" id="question-title-input" defaultValue={props.question.title}></input>
            </div>
        );
    }

    return (
        <div>
            <h1>Question Title*</h1>
            <p>Limit title to 50 characters or less.</p>
            <input type="text" id="question-title-input"></input>
        </div>
    );
}

function QuestionTextField(props) {
    if (props.editMode === 1) {
        return (
            <div>
                <h1>Question Text*</h1>
                <p>Add details</p>
                <textarea rows={4} cols={50} id="question-text-input" defaultValue={props.question.text}></textarea>
            </div>
        );
    }

    return (
        <div>
            <h1>Question Text*</h1>
            <p>Add details</p>
            <textarea rows={4} cols={50} id="question-text-input"></textarea>
        </div>
    );
}

// TO-DO: Get tags from their ids first
class QuestionTagsField extends React.Component {
    constructor(props) {
        super(props)
        this.state = { tags: [] }
    }

    componentDidMount() {
        if (this.props.editMode === 0)
            return
        
        axios.post("http://localhost:8000/question/get_tags", this.props.question.tags)
            .then(res => {
                console.log("Tags have been obtained.")
                this.setState({ tags: res.data })
            })
            .catch(err => {
                console.log(err)
                window.alert(`The server could not obtain the question's tags! \n${err}`)
            })
    }

    render() {
        if (this.props.editMode === 1) {
            let tagSetString = "";
            if (this.state.tags.length > 0) {
                this.state.tags.forEach(tag => {
                    const tagName = tag.name;
                    tagSetString += tagName + " ";
                })
                tagSetString = tagSetString.substring(0, tagSetString.length-1)
            }

            return (
                <div>
                    <h1>Tags*</h1>
                    <p>Add keywords separated by whitespace. You need to have at least 50 reputation to make new tags.</p>
                    <input type="text" id="tags-input" defaultValue={tagSetString}></input>
                </div>
            );
        }

        return (
            <div>
                <h1>Tags*</h1>
                <p>Add keywords separated by whitespace. You need to have at least 50 reputation to make new tags.</p>
                <input type="text" id="tags-input"></input>
            </div>
        );
    }
}

function QuestionSummaryField(props) {
    if (props.editMode === 1) {
        return (
            <div>
                <h1>Question Summary</h1>
                <p>Limit question summary up to 140 characters.</p>
                <textarea rows={4} cols={50} id="question-summary-input" defaultValue={props.question.summary}></textarea>
            </div>
        );
    }

    return (
        <div>
            <h1>Question Summary</h1>
            <p>Limit question summary up to 140 characters.</p>
            <textarea rows={4} cols={50} id="question-summary-input"></textarea>
        </div>
    );
}

/* Helper functions for submitting a new question. */

async function searchTag(tagName) {
    let tagObj;
    const nameField = { name: tagName };
    const encodedField = encodeURIComponent(nameField.name);

    await axios.get(`http://localhost:8000/get_by_fields/tag?name=${encodedField}`)
        .then(res => {
            tagObj = res.data;
        })
        .catch(err => {
            console.log(err)
            const newQuestionForm = document.getElementById("new-question-form");
            newQuestionForm.reset();
            return;
        });

    if(!tagObj) {
        await axios.post('http://localhost:8000/create_model/tag', nameField)
            .then(res => {
                tagObj = res.data;
            })
            .catch(err => {
                console.log(err)
                const newQuestionForm = document.getElementById("new-question-form");
                newQuestionForm.reset();
                return;
            })
    }
    return tagObj;
}

async function verifyInputs(questionTitle, questionSummary, questionText, tags, user) {
    let hasError = false;

    if (questionTitle.length < 1 || questionTitle.length >= 50) {
        hasError = true;
        const errorMsg = "The question title is either empty or too long.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "question-title-input");
    }

    if (questionSummary.length > 140) {
        hasError = true;
        const errorMsg = "The question summary is too long.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "question-summary-input");
    }

    if (questionText.length < 1) {
        hasError = true;
        const errorMsg = "The question text is empty.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "question-text-input");
    }

    // Check if there is a string enclosed in [], then there should be a () with https:// or http://
    if (!hasValidHyperlink(questionText)) {
        hasError = true;
        const errorMsg = "One or more hyperlinks in the text are invalid.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "question-text-input");
    }

    /* Verify the tags here. */
    const tagsArr = tags.split(" ").map((tag) => tag.toLowerCase());
    console.log("tagsArr: " + tagsArr);
    if (tagsArr.length > 5) {
        hasError = true;
        const errorMsg = "You have more than 5 tags in your tags field.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "tags-input");
    }

    for (const tag of tagsArr) {
        if (tag.length < 1 || tag.length > 20) {
            hasError = true;
            const errorMsg = "The tag \"" + tag + "\" is either invalid or has more than 10 characters.";
            console.log(errorMsg);
            displayErrorText(errorMsg, "tags-input");
            break;
        }
    }

    // TO-DO: Make it so that if one of the tags is not in the database, check if the user has at least 50 reputation.
    for (const tag of tagsArr) {
        let tagObj;
        const nameField = { name: tag };
        const encodedField = encodeURIComponent(nameField.name);

        await axios.get(`http://localhost:8000/get_by_fields/tag?name=${encodedField}`)
            .then(res => {
                tagObj = res.data;
            })
            .catch(err => {
                console.log(err)
                window.alert(err)
                const newQuestionForm = document.getElementById("new-question-form");
                newQuestionForm.reset();
                return;
            });
        
        if (!tagObj && user.reputation < 50) {
            hasError = true;
            const errorMsg = "The tag \"" + tag + "\" cannot be created since you do not have at least 50 reputation to make this tag.";
            console.log(errorMsg);
            displayErrorText(errorMsg, "tags-input");
            break;
        }
    }
    
    return hasError;
}