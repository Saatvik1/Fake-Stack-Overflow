import "../stylesheets/comment.css";

import React from "react";
import axios from "axios";


//Get comment details passed down as a prop then send the correct fields for comments to child components.

export default class Comment extends React.Component {
    constructor(props) {
        super(props)
        this.state = {votes: props.comment.votes}
        this.incrementVote = this.incrementVote.bind(this)
    }

    async incrementVote(){
        //put request to update vote
        await axios.put(`http://localhost:8000/update/comment/${this.props.comment._id}`, {votes: (this.state.votes+1)})
        this.props.comment.votes = this.props.comment.votes +1
        this.setState({
            votes : this.state.votes + 1,
        })
    }

    render(){
        return (
            <div className = "answer">
                <CommentText text = {this.props.comment.text}/>
                <Username username={this.props.comment.username}/>
                <Vote UserManager={this.props.UserManager} votes={this.props.comment.votes} incrementVote = {this.incrementVote}/>
            </div>
        )
    }
}



class CommentText extends React.Component {
    render() {
        return (
            <div className="comment-text">
                <p>{this.props.text}</p>
            </div>
        )
    }
}


class Username extends React.Component {
    render() {
        //Update empty field down there with username.
        return (
            <div className="username-text">
                <span style={{color: "green"}}>{this.props.username}</span>
            </div>
        );
    }
}

class Vote extends React.Component {
    render() {
        //Button down there will access state of parent class, change vote by passing down a function.
        if(this.props.UserManager.user.accName === "guest"){
            return (
                <div className="username-text">
                    <span>{this.props.votes}</span>
                </div>
            );
        } else {
            return (
                <div className="username-text">
                    <span>{this.props.votes}</span>
                    <button onClick={this.props.incrementVote}>Upvote</button>
                </div>
            );
        }
        
    }
}