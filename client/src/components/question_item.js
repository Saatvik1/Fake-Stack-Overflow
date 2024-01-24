import '../stylesheets/question.css';
import axios from 'axios'
import React from "react";
import { getDateDisplay } from '../utilities/date_helper_functions';

/* Parameters: title, text, tagIds, askedBy, askDate, ansIds, views, url */
class Question extends React.Component {
    render() {
        return (
            <div className="question">
                <AnswersViews UserManager={this.props.UserManager} ansIds={this.props.ansIds} views={this.props.views} />
                <QuestionVotes UserManager={this.props.UserManager} questionObj = {this.props.questionObj} votes = {this.props.votes} id = {this.props.qKey} userID = {this.props.userID}/>
                <QuestionTitle UserManager={this.props.UserManager} PageManager={this.props.PageManager} 
                    title={this.props.title} tagIds={this.props.tagIds} 
                    qKey = {this.props.qKey} url={this.props.url}
                    views={this.props.views}
                />
                <QuestionSummary UserManager={this.props.UserManager} summary = {this.props.summary} />
                <UsernameDate UserManager={this.props.UserManager} askedBy={this.props.askedBy} askDate={this.props.askDate} />
            </div>
        )
    }
}

class QuestionVotes extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            votes : undefined
        }
    }

    async componentDidMount() {
        await axios.get(`http://localhost:8000/get/question/${this.props.id}`)
            .then(res => {
                console.log(res.data._id)
                this.setState({votes : res.data.votes})
            })
            .catch(err => {
                console.log(err)
            })
    }
    

    async vote(vote){

        if(this.props.UserManager.user.reputation >= 50){
            if(vote){
                //Upvote
                this.props.questionObj.votes = this.props.questionObj.votes + 1
                let user = undefined
                await axios.put(`http://localhost:8000/update/question/${this.props.questionObj._id}`, {votes : this.props.questionObj.votes})
                    .then(res => {
                        
                    })
                    .catch(err => {
                        console.log(err)
                        return
                    })
    
                await axios.get(`http://localhost:8000/get/user/${this.props.userID}`)
                    .then(res => {
                        user = res.data
                        //console.log("nah bruh")
                    })
                    .catch(err => {
                        console.log(err)
                    })
    
    
                //console.log(user)
                let reputation = user.reputation + 5
                
                await axios.put(`http://localhost:8000/update/user/${this.props.userID}`, {reputation : reputation})
                    .then(res => {
                        console.log("succesfully updated reputation")
                    })
                    .catch(err => {
                        console.log(err)
                    })
                
                this.setState({votes : this.state.votes + 1})
    
    
    
            } else {
    
                this.props.questionObj.votes = this.props.questionObj.votes - 1
                let user = undefined
                await axios.put(`http://localhost:8000/update/question/${this.props.questionObj._id}`, {votes : this.props.questionObj.votes})
                    .then(res => {
                        
                    })
                    .catch(err => {
                        console.log(err)
                        return
                    })
    
                await axios.get(`http://localhost:8000/get/user/${this.props.userID}`)
                    .then(res => {
                        user = res.data
                        //console.log("nah bruh")
                    })
                    .catch(err => {
                        console.log(err)
                    })
    
    
                //console.log(user)
                let reputation = user.reputation - 10
                
                await axios.put(`http://localhost:8000/update/user/${this.props.userID}`, {reputation : reputation})
                    .then(res => {
                        console.log("succesfully updated reputation")
                    })
                    .catch(err => {
                        console.log(err)
                    })
                
                this.setState({votes : this.state.votes - 1})
    
    
            }
        } else {
            console.log("not enough reputation")
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

class QuestionSummary extends React.Component {
    render() {
        return (
            <div className="summary-view">
                <p>{this.props.summary}</p>
            </div>
        )
    }
}

class AnswersViews extends React.Component {
    render() {
        return (
            <div className="answers-views">
                {this.props.ansIds.length + " answers"}<br/>
                {this.props.views + " views"}
            </div>
        )
    }
}

class QuestionTitle extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            tags: []
        };
        this.goToAnswerPage = this.goToAnswerPage.bind(this)
        // console.log(this.props.qkey)
    }

    componentDidMount() {
        axios.get('http://localhost:8000/get/tags')
            .then(res => {
                const tagIds = this.props.tagIds;
                const tags = res.data;
                let tagsList = tagIds.map((tagId) => tags.find((tag) => tag._id === tagId)).filter(Boolean);
                this.setState({tags: tagsList});
            })
            .catch(err => {
                console.log("No tags have been found.");
                this.setState({tags: []});
            });
    }

    goToAnswerPage() {
        const updatedViews = { views: (this.props.views+1) }
        axios.put(`http://localhost:8000/update/question/${this.props.qKey}`, updatedViews)
            .then(res => {
                console.log("Successful view increment. Updated view count: " + res.data.views);
            })
            .catch(err => {
                console.log("Unsuccessful view increment. " + err);
            })

        this.props.PageManager.updatePage("answer page", this.props.qKey);
    }

    render() {
        const tagItems = this.state.tags.map((tag) =>
            <div key={tag._id} className="tag">{tag.name}</div>
        );

        return (
            <div className="question-title">
                <a href={"#" + this.props.url} onClick = {this.goToAnswerPage}>{this.props.title}</a>
                <div className="tags-section">
                    {tagItems}
                </div>
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

export default Question;