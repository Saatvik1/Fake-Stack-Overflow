import "../stylesheets/answers_page.css";

import React from "react";
import axios from "axios";
import { getDateDisplay } from "../utilities/date_helper_functions";
import { convertTextWithHyperlinks } from "../utilities/hyperlink_helper_functions";
import Answer from "./answer_item";
import Comment from "./comment";

export default class AnswerPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {questionObj: undefined}
        this.goToAddAnswerPage = this.goToAddAnswerPage.bind(this)
    }
    

    componentDidMount() {
        axios.get(`http://localhost:8000/get/question/${this.props.qKey}`)
            .then(res => {
                this.setState({questionObj: res.data});
            })
            .catch(err => {
                console.log(err);
                this.setState({questionObj: undefined});
            })
    }

    goToAddAnswerPage() {
        this.props.PageManager.updatePage("add answer page", this.state.questionObj);
    }

    render() {
        if(!this.state.questionObj)
            return <div>Loading...</div>

        if(this.props.UserManager.user.accName === "guest"){
            return (
                <div className="answer-page">
                    <AnswerPageTopHeader UserManager={this.props.UserManager} PageManager={this.props.PageManager} question = {this.state.questionObj}/>
                    <AnswerPageBottomHeader question = {this.state.questionObj} UserManager = {this.props.UserManager}/>
                    <AnswerList UserManager = {this.props.UserManager} question = {this.state.questionObj}/>
                </div>
            )
        } else {
            return (
                <div className="answer-page">
                    <AnswerPageTopHeader UserManager={this.props.UserManager} PageManager={this.props.PageManager} question = {this.state.questionObj}/>
                    <AnswerPageBottomHeader question = {this.state.questionObj} UserManager = {this.props.UserManager}/>
                    <AnswerList UserManager = {this.props.UserManager} question = {this.state.questionObj}/>
                    <button className="add-answer-button" onClick = {this.goToAddAnswerPage}>Answer Question</button>
                </div>
            )
        }
        
    }
}

class AnswerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answers: [],
            leftPointer: undefined,
            rightPointer: undefined,
            lengthOfAnswers: undefined,
        };
        this.handlePrevious = this.handlePrevious.bind(this)
        this.handleNext = this.handleNext.bind(this)
    }

    async componentDidMount() {
        const getAnswerFromId = async (answerId) => {
            let answer;
            await axios.get(`http://localhost:8000/get/answer/${answerId}`)   
                .then(res => {
                    answer = res.data;
                })
                .catch(err => {
                    console.log(err);
                })
            return answer;
        }

        const answerIds = this.props.question.answers;
        const answerObjs = [];
        for(const answerId of answerIds) {
            const answerObj = await getAnswerFromId(answerId);
            answerObjs.push(answerObj)
        }


        if (answerObjs.length > 5) {
            this.setState({
                answers: answerObjs,
                leftPointer: 0,
                rightPointer: 4,
                lengthOfAnswers: answerObjs.length,
            })
        } else {
            this.setState({answers: answerObjs})
        }

        
    }

    handlePrevious() {
        console.log("handle previous")

        if (this.state.leftPointer - 5 < 0) {
            //Do nothing
            console.log("cant go back")
        } else {
            this.setState({
                leftPointer: this.state.leftPointer - 5,
                rightPointer: this.state.rightPointer - 5,
            })
        }

    }

    handleNext() {
        if (this.state.leftPointer + 5 >= this.state.lengthOfAnswers) {
            //Roundtrip
            this.setState({
                leftPointer: 0,
                rightPointer: 4,
            })
        } else {
            this.setState({
                leftPointer: this.state.leftPointer + 5,
                rightPointer: this.state.rightPointer + 5,
            })
        }
    }

    render() {
        let answerItems
        if(this.state.lengthOfAnswers > 5){
            answerItems = this.state.answers.slice(this.state.leftPointer, this.state.rightPointer + 1).map((answer) => {
                return <Answer key={answer._id} answerObj = {answer} UserManager = {this.props.UserManager}/>
            });
        } else {
            answerItems = this.state.answers.map((answer) => {
                return <Answer key={answer._id} answerObj = {answer} UserManager = {this.props.UserManager}/>
            });
        }
        
        
        return (
            <div className = "answer-list">
                {answerItems}
                <div className="scroll-buttons">
                    <button onClick={this.handlePrevious}>Prev</button>
                    <button onClick={this.handleNext}>Next</button>
                </div>
            </div>
        )
    }
}

class AnswerPageTopHeader extends React.Component {
    constructor(props) {
        super(props)
        this.goToAskQuestionPage = this.goToAskQuestionPage.bind(this);
        console.log((this.props.question.answers.length))
    }

    goToAskQuestionPage() {
        this.props.PageManager.updatePage("ask question page", 0);
    }

    render() {
        if(this.props.UserManager.user.accName === "guest"){
            return (
                <section className="top-header">
                    <h1 className="num-answers">{this.props.question.answers.length === 1 ? "1 answer" : this.props.question.answers.length + " answers" }</h1>
                    <h1 className="question-title">{this.props.question.title}</h1>
                </section>
            )
        } else {
            return (
                <section className="top-header">
                    <h1 className="num-answers">{this.props.question.answers.length === 1 ? "1 answer" : this.props.question.answers.length + " answers" }</h1>
                    <h1 className="question-title">{this.props.question.title}</h1>
                    <button onClick={this.goToAskQuestionPage}>Ask Question</button>
                </section>
            )
        }
        
    }
}

class AnswerPageBottomHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: [],
            leftPointer: props.question.comments.length > 3 ? 0 : undefined,
            rightPointer: props.question.comments.length > 3 ? 2 : undefined,
            lengthOfComments: props.question.comments.length,
        };
        this.handlePrevious = this.handlePrevious.bind(this)
        this.handleNext = this.handleNext.bind(this)
        this.submitComment = this.submitComment.bind(this)

    }

    async componentDidMount() {
        const getCommentFromId = async (commentId) => {
            let comment;
            await axios.get(`http://localhost:8000/get/comment/${commentId}`)   
                .then(res => {
                    comment = res.data;
                })
                .catch(err => {
                    console.log(err);
                })
            return comment;
        }

        const commentIds = this.props.question.comments;
        console.log(commentIds)
        const commentObjs = [];
        for(const commentId of commentIds) {
            const commentObj = await getCommentFromId(commentId);
            commentObjs.push(commentObj)
        }

        console.log(commentObjs)
        
        for (let i = 0; i < commentObjs.length - 1; i++) {
            for (let j = 0; j < commentObjs.length - i - 1; j++) {
              const date1 = commentObjs[j].comment_date;
              const date2 = commentObjs[j + 1].comment_date;
          
              if (date1 < date2) {
                const temp = commentObjs[j];
                commentObjs[j] = commentObjs[j + 1];
                commentObjs[j + 1] = temp;
              }
            }
          }

        const sortedCommentObjs = commentObjs;
        
          

        this.setState({
            comments : sortedCommentObjs,
        })
        
    }

    async componentDidUpdate(prevProps, prevState){
        const getCommentFromId = async (commentId) => {
            let comment;
            await axios.get(`http://localhost:8000/get/comment/${commentId}`)   
                .then(res => {
                    comment = res.data;
                })
                .catch(err => {
                    console.log(err);
                })
            return comment;
        }

        const commentIds = this.props.question.comments;
        console.log(commentIds)
        const commentObjs = [];
        for(const commentId of commentIds) {
            const commentObj = await getCommentFromId(commentId);
            commentObjs.push(commentObj)
        }

        console.log(commentObjs)
        
        for (let i = 0; i < commentObjs.length - 1; i++) {
            for (let j = 0; j < commentObjs.length - i - 1; j++) {
              const date1 = commentObjs[j].comment_date;
              const date2 = commentObjs[j + 1].comment_date;
          
              if (date1 < date2) {
                const temp = commentObjs[j];
                commentObjs[j] = commentObjs[j + 1];
                commentObjs[j + 1] = temp;
              }
            }
          }

        const sortedCommentObjs = commentObjs;
        
          
        console.log(prevState.comments)
        console.log(this.state.comments)
        if(JSON.stringify(prevState.comments) !== JSON.stringify(sortedCommentObjs)){

            console.log("different")
            this.setState({
                comments : sortedCommentObjs,
            })
        }
        
    }

    handlePrevious() {
        console.log("handle previous")

        if (this.state.leftPointer - 3 < 0) {
            //Do nothing
            console.log("cant go back")
        } else {
            this.setState({
                leftPointer: this.state.leftPointer - 3,
                rightPointer: this.state.rightPointer - 3,
            })
        }

    }

    handleNext() {
        if (this.state.leftPointer + 3 >= this.state.lengthOfComments) {
            //Roundtrip
            this.setState({
                leftPointer: 0,
                rightPointer: 2,
            })
        } else {
            this.setState({
                leftPointer: this.state.leftPointer + 3,
                rightPointer: this.state.rightPointer + 3,
            })
        }
    }

    async submitComment(event){
        event.preventDefault()

        if(this.props.UserManager.user.reputation < 50){
            console.log("Not enough rep to comment")
            return
        }

        const text = await document.getElementById("comment-input").value;
        const username = await this.props.UserManager.user.username
        const votes = await 0
        const comment_date = await new Date()

        const commentObj = {
            text : text,
            username : username, 
            votes : votes,
            comment_date : comment_date,
        }

        let commentID = undefined
        await axios.post(`http://localhost:8000/create_model/comment`, commentObj)
            .then(res => {
                console.log(res.data)
                commentID = res.data._id
            })
            .catch(err => {
                console.log(err)
            })

        if(commentID){
            //Add id to questionObj
            this.props.question.comments.push(commentID)
            await axios.put(`http://localhost:8000/update/question/${this.props.question._id}`, {comments : this.props.question.comments})
                .then(res => {
                    console.log("success adding comment to question")
                }
                )
                .catch(err => {
                    console.log(err)
                })
        }

        this.setState({comments : this.props.question.comments})
        

    }



    render() {
        //{commentList} add this to returnunder comments-container

        let sortedComments = this.state.comments;
        let commentList = undefined;
    
        if(sortedComments){
            if(sortedComments.length > 3){
                commentList = sortedComments
                .slice(this.state.leftPointer, this.state.rightPointer+1)
                .map((comment) => {
                    return <Comment UserManager={this.props.UserManager} comment = {comment}/>
                })
            } else {
                commentList = sortedComments.map((comment) => {
                    return <Comment UserManager={this.props.UserManager} comment = {comment}/>
                })
            }
        } else {

        }
        
        if(this.props.UserManager.user.accName === "guest"){
            return (
                <section className="bottom-header">
                    <h2>{this.props.question.views === 1 ? "1 view" : this.props.question.views + " views"}</h2>
                    <QuestionText text={this.props.question.text} />
                    <UsernameDate askedBy={this.props.question.asked_by} askDate={this.props.question.ask_date_time}/>
                    <div className="comments-container-question">
                        {commentList}
                        <div className="scroll-buttons-question">
                            <button onClick={this.handlePrevious}>Prev</button>
                            <button onClick={this.handleNext}>Next</button>
                        </div>
                </div>
                </section>
            )
        } else {
            return (
                <section className="bottom-header">
                    <h2>{this.props.question.views === 1 ? "1 view" : this.props.question.views + " views"}</h2>
                    <QuestionText text={this.props.question.text} />
                    <UsernameDate askedBy={this.props.question.asked_by} askDate={this.props.question.ask_date_time}/>
                    <div className="comments-container-question">
                        {commentList}
                        <form id = "new-comment-form" action="/submit" onSubmit = {this.submitComment} method = "post">
                            <CommentField />
                            <p className="star-indicator">* indicates mandatory fields.</p>
                            <input type="submit" id="post-button-comment" value={"Post Comment"}></input>
                        </form>
                        <div className="scroll-buttons-question">
                            <button onClick={this.handlePrevious}>Prev</button>
                            <button onClick={this.handleNext}>Next</button>
                        </div>
                </div>
                </section>
            )
        }
        
    }
}

function CommentField() {
    return (
        <div>
            <h1>Comment*</h1>
            <input type="text" id="comment-input"></input>
        </div>
    );
}

class QuestionText extends React.Component {
    render() {
        const output = convertTextWithHyperlinks(this.props.text);
        return (
            <div className="question-text">
                {output}
            </div>
        );
    }
}

class UsernameDate extends React.Component {
    render() {
        return (
            <div className="username-date">
                <span style={{color: "red"}}>{this.props.askedBy}</span> asked {getDateDisplay(this.props.askDate)}
            </div>
        );
    }
}