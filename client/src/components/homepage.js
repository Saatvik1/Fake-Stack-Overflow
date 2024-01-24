import '../stylesheets/home_page.css';

import React from "react";
import axios from 'axios';
import Question from './question_item.js';
import {sortByNewest, sortByActive, sortByUnanswered} from '../utilities/sort_functions.js'

export default class HomePage extends React.Component {
    constructor(props){
        super(props)
        this.changeSortingSetting = this.changeSortingSetting.bind(this)
        console.log(props)
        if(props.passedSort === undefined){
            this.state = {
                currentSetting : "default"
            }
        } else {
            this.state = {
                currentSetting : props.passedSort[0]
            }
        }
        
    }

    changeSortingSetting = (updatedSetting) => {
        this.setState({ currentSetting: updatedSetting });
    }

    render() {
        return (
            <div>
                <TopHeader UserManager={this.props.UserManager} PageManager={this.props.PageManager} />
                <BottomHeader UserManager={this.props.UserManager} changeSortingSetting={this.changeSortingSetting}/>
                <ContentList UserManager={this.props.UserManager} PageManager={this.props.PageManager} setting = {this.state.currentSetting} />
            </div>
        )
    }
}

/* This ContentList component will output all of the questions from the Model. */
class ContentList extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            questions: [],
            leftPointer: undefined,
            rightPointer: undefined,
            lengthOfQuestions: undefined,    
        }
        this.sortQuestions = this.sortQuestions.bind(this)
        this.handlePrevious = this.handlePrevious.bind(this)
        this.handleNext = this.handleNext.bind(this)
    }

    /* The http request for http://localhost:8000/get/questions should output 
     * all of the questions from the fake_so database from the server interacting with mongodb.
     */
    componentDidMount() {
        axios.get("http://localhost:8000/get/questions")
            .then(res => {
                this.setState({questions: res.data})
                if (res.data.length > 5) {
                    this.setState({
                        leftPointer: 0,
                        rightPointer: 4,
                        lengthOfQuestions: res.data.length,
                    })
                } else {
                    this.setState({
                        lengthOfQuestions : res.data.length,
                    })
                }
            })
            .catch(err => {
                console.log("There are no questions here.");
                this.setState({questions: []});
            });
    }

    sortQuestions() {
        let questions = this.state.questions;

        if (this.props.setting === "sortByNewest" || this.props.setting === "default") {
            questions = sortByNewest(questions);
        } else if (this.props.setting === "sortByActive") {
            questions = sortByActive(questions);
        }
        else if (this.props.setting === "sortByUnanswered") {
            questions = sortByUnanswered(questions);
        } else {
            questions = sortByNewest(questions);
        }

        return questions
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
        if (this.state.leftPointer + 5 >= this.state.lengthOfQuestions) {
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
        let questions = undefined;
        var questionItems;
        if (this.state.lengthOfQuestions <= 5) {
            questions = this.sortQuestions()
            questionItems = questions.map((question) =>
                <Question
                    key={question._id}
                    UserManager={this.props.UserManager}
                    questionObj = {question}
                    PageManager={this.props.PageManager}
                    qKey={question._id}
                    title={question.title}
                    text={question.text}
                    tagIds={question.tags}
                    askedBy={question.asked_by}
                    askDate={question.ask_date_time}
                    ansIds={question.answers}
                    views={question.views}
                    summary={question.summary}
                    votes = {question.votes}
                    userID = {question.userID}
                    url={question.url}
                />
            );
        } else {
            questions = this.sortQuestions()
            let questionLimit = questions.slice(this.state.leftPointer, this.state.rightPointer + 1)
            questionItems = questionLimit.map((question) =>
                <Question
                    key={question._id}
                    UserManager={this.props.UserManager}
                    questionObj = {question}
                    PageManager={this.props.PageManager}
                    qKey={question._id}
                    title={question.title}
                    text={question.text}
                    tagIds={question.tags}
                    askedBy={question.asked_by}
                    askDate={question.ask_date_time}
                    ansIds={question.answers}
                    views={question.views}
                    summary={question.summary}
                    votes = {question.votes}
                    userID = {question.userID}
                    url={question.url}
                />
            );
        }

        if (this.state.lengthOfQuestions <= 5) {
            return (
                <div className="content-list">
                    {questionItems}
                </div>
            )
        } else {
            return (
                <div className="content-list">
                    {questionItems}
                    <div className="scroll-buttons">
                        <button onClick={this.handlePrevious}>Prev</button>
                        <button onClick={this.handleNext}>Next</button>
                    </div>
                </div>
            )
        }
    }
}

class TopHeader extends React.Component {
    constructor(props) {
        super(props);
        this.goToAskQuestionPage = this.goToAskQuestionPage.bind(this);
    }

    goToAskQuestionPage() {
        this.props.PageManager.updatePage("ask question page", 0);
    }

    render() {
        if(this.props.UserManager.user.accName === "guest"){
            return (
                <section className="top-header">
                    <h1>All Questions</h1>
                </section>
            );
        } else {
            console.log(this.props.UserManager.user.accName)
            return (
                <section className="top-header">
                    <h1>All Questions</h1>
                    <button onClick={this.goToAskQuestionPage}>Ask Question</button>
                </section>
            );
        }
        
    }
}

class BottomHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numQuestions: 0
        }
    };

    componentDidMount() {
        axios.get("http://localhost:8000/get/questions")
            .then(res => {
                let questions = res.data;
                this.setState({numQuestions: questions.length});
            })
            .catch(err => {
                console.log("The number of questions is 0.");
                this.setState({numQuestions: 0});
            })
    }
    
    render() {
        return (
            <section className="bottom-header">
                <h2>{this.state.numQuestions === 1 ? "1 question" : this.state.numQuestions + " questions"}</h2>
                <SortButtons changeSortingSetting = {this.props.changeSortingSetting}/>
            </section>
        );
    }
}

class SortButtons extends React.Component {

    render() {
        return (
            <div className="sort-buttons">
                <SortButton changeSortingSetting = {this.props.changeSortingSetting} name="Newest" />
                <SortButton changeSortingSetting = {this.props.changeSortingSetting} name="Active" />
                <SortButton changeSortingSetting = {this.props.changeSortingSetting} name="Unanswered" />
            </div>
        )
    }
    
}

class SortButton extends React.Component {
    constructor(props){
        super(props);
        this.handleNewest = this.handleNewest.bind(this)
      }

      handleNewest = (event) =>{
        //console.log(event)
        this.props.changeSortingSetting(event);
        //console.log("clicki g")
      }
//sdasda

    render() {
        return (
            <button onClick = {() => this.handleNewest("sortBy"+this.props.name)} id ={"sortBy"+this.props.name}>{this.props.name}</button>
        )
    }
}