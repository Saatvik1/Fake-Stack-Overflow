import "../stylesheets/answer.css";

import React from "react";
import { getDateDisplay } from "../utilities/date_helper_functions";
import { convertTextWithHyperlinks } from "../utilities/hyperlink_helper_functions";
import Comment from "./comment";
import axios from "axios";

export default class Answer extends React.Component {
    render(){
        return (
            <div className = "answer">
                <AnswerText UserManager = {this.props.UserManager} answerT = {this.props.answerObj.text}/>
                <AnswerVotes UserManager = {this.props.UserManager} answerObj = {this.props.answerObj}/>
                <UsernameDate UserManager = {this.props.UserManager} askedBy={this.props.answerObj.ans_by} askDate={this.props.answerObj.ans_date_time}/>
                <CommentList answerObj = {this.props.answerObj} UserManager = {this.props.UserManager}/>
            </div>
        )
    }
}

class AnswerVotes extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            votes : undefined
        }
    }

    async componentDidMount() {
        await axios.get(`http://localhost:8000/get/answer/${this.props.answerObj._id}`)
            .then(res => {
                console.log(res.data._id)
                this.setState({votes : res.data.votes})
            })
            .catch(err => {
                console.log(err)
            })
    }

    async vote(vote){

        if(this.props.UserManager.user.reputation < 50){
            return
        }

        if(vote){
            //Upvote
            this.props.answerObj.votes = this.props.answerObj.votes + 1
            let user = undefined
            await axios.put(`http://localhost:8000/update/answer/${this.props.answerObj._id}`, {votes : this.props.answerObj.votes})
                .then(res => {
                    
                })
                .catch(err => {
                    console.log(err)
                    return
                })

            await axios.get(`http://localhost:8000/get/user/${this.props.answerObj.userID}`)
                .then(res => {
                    user = res.data
                    //console.log("nah bruh")
                })
                .catch(err => {
                    console.log(err)
                })


            //console.log(user)
            let reputation = user.reputation + 5
            
            await axios.put(`http://localhost:8000/update/user/${this.props.answerObj.userID}`, {reputation : reputation})
                .then(res => {
                    console.log("succesfully updated reputation")
                })
                .catch(err => {
                    console.log(err)
                })
            
            this.setState({votes : this.state.votes + 1})



        } else {

            this.props.answerObj.votes = this.props.answerObj.votes - 1
            let user = undefined
            await axios.put(`http://localhost:8000/update/answer/${this.props.answerObj._id}`, {votes : this.props.answerObj.votes})
                .then(res => {
                    
                })
                .catch(err => {
                    console.log(err)
                    return
                })

            await axios.get(`http://localhost:8000/get/user/${this.props.answerObj.userID}`)
                .then(res => {
                    user = res.data
                    //console.log("nah bruh")
                })
                .catch(err => {
                    console.log(err)
                })


            //console.log(user)
            let reputation = user.reputation - 10
            
            await axios.put(`http://localhost:8000/update/user/${this.props.answerObj.userID}`, {reputation : reputation})
                .then(res => {
                    console.log("succesfully updated reputation")
                })
                .catch(err => {
                    console.log(err)
                })
            
            this.setState({votes : this.state.votes - 1})


        }
        //Nothing here
    }

    render(){
        if(this.props.UserManager.user.accName === "guest"){
            return (
                <div>
                    <p>{this.state.votes}</p>
                </div>
            )
        } else {
            return (
                <div>
                    <p>{this.state.votes}</p>
                    <button onClick={() => this.vote(true)}>Upvote</button>
                    <button onClick={() => this.vote(false)}>Downvote</button>
                </div>
            )
        }
        
    }
}

class CommentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: [],
            leftPointer: props.answerObj.comments.length > 3 ? 0 : undefined,
            rightPointer: props.answerObj.comments.length > 3 ? 2 : undefined,
            lengthOfComments: props.answerObj.comments.length,
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

        const commentIds = this.props.answerObj.comments;
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

        // if (answerObjs.length > 5) {
        //     this.setState({
        //         answers: answerObjs,
        //         leftPointer: 0,
        //         rightPointer: 4,
        //         lengthOfAnswers: answerObjs.length,
        //     })
        // } else {
        //     this.setState({answers: answerObjs})
        // }

        
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
            console.log("Not enough reputation to comment")
            return
        }

        const text = await document.getElementById(`comment-input-${this.props.answerObj._id}`).value;
        const username = await this.props.UserManager.user.username
        const votes = await 0
        const comment_date = await new Date()

        const commentObj = {
            text : text,
            username : username, 
            votes : votes,
            comment_date : comment_date,
        }

        console.log(commentObj)

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
            //Add id to answerObj
            this.props.answerObj.comments.push(commentID)
            await axios.put(`http://localhost:8000/update/answer/${this.props.answerObj._id}`, {comments : this.props.answerObj.comments})
                .then(res => {
                    console.log("success adding comment to answer")
                }
                )
                .catch(err => {
                    console.log(err)
                })
        }

        this.setState({comments : this.props.answerObj.comments})
        
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

        const commentIds = this.props.answerObj.comments;
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


    render() { 

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
        
        //console.log(this.state.comments)
        //console.log(commentList)


        if(this.props.UserManager.user.accName === "guest"){
            return (
                <div className="comments-container">
                    {commentList}
                    <div className="scroll-buttons-answer">
                        <button onClick={this.handlePrevious}>Prev</button>
                        <button onClick={this.handleNext}>Next</button>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="comments-container">
                    {commentList}
                    <form id = "new-comment-form-answer" action="/submit" onSubmit = {this.submitComment} method = "post">
                        <CommentField id = {this.props.answerObj._id}/>
                        <p className="star-indicator">* indicates mandatory fields.</p>
                        <input type="submit" id="post-button-comment" value={"Post Comment"}></input>
                    </form>
                    <div className="scroll-buttons-answer">
                        <button onClick={this.handlePrevious}>Prev</button>
                        <button onClick={this.handleNext}>Next</button>
                    </div>
                </div>
            )
        }

        
    }
}

function CommentField(props) {
    return (
        <div>
            <h1>Comment*</h1>
            <input type="text" id={`comment-input-${props.id}`}></input>
        </div>
    );
}

class AnswerText extends React.Component {
    render() {
        const output = convertTextWithHyperlinks(this.props.answerT);
        return (
            <div className="answer-text">
                {output}
            </div>
        )
    }
}


class UsernameDate extends React.Component {
    render() {
        return (
            <div className="username-date">
                <span style={{color: "green"}}>{this.props.askedBy}</span> asked {getDateDisplay(this.props.askDate)}
            </div>
        );
    }
}