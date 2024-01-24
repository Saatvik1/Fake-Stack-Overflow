import '../stylesheets/home_page.css';

import React from "react";
import Question from './question_item'; 
import {sortByNewest, sortByActive, sortByUnanswered} from '../utilities/sort_functions'
import axios from 'axios';

export default class SearchResultPage extends React.Component {
    constructor(props){
        console.log("constructor")
        super(props)
        this.changeSortingSetting = this.changeSortingSetting.bind(this)
        this.state = {
            currentSetting : "default"
        }
        console.log(props)
    }
    
    changeSortingSetting = (updatedSetting) => {
        this.setState({ currentSetting: updatedSetting });
    }

    render() {
        return (
            <div>
                <TopHeader PageManager={this.props.PageManager} UserManager={this.props.UserManager}/>
                <ContentList UserManager={this.props.UserManager} PageManager={this.props.PageManager} changeSortingSetting={this.changeSortingSetting} setting = {this.state.currentSetting} searchValue={this.props.searchValue}/>
            </div>
        )
    }
}

/* This ContentList component will output all of the questions from the Model. */
class ContentList extends React.Component {
    constructor(props){
        super(props)
        this.basicSearch = this.basicSearch.bind(this)
        this.state = {
            tags : [],
            questions: [],
            leftPointer: undefined,
            rightPointer: undefined,
            lengthOfQuestions: undefined,
        }
        this.handlePrevious = this.handlePrevious.bind(this)
        this.handleNext = this.handleNext.bind(this)
    }


    componentDidMount(){
        let tagsList;
        let questionList;
        axios.get('http://localhost:8000/get/tags')
            .then(res => {
                //console.log(res.data)
                tagsList = res.data    
                this.setState({tags: tagsList})
            })
            .catch(err => {
                this.setState({tags: []});
            });

        axios.get('http://localhost:8000/get/questions')
            .then(res => {
                //console.log(res.data)
                questionList = res.data    
                this.setState({questions: questionList})
                if (res.data.length > 5) {
                    this.setState({
                        leftPointer: 0,
                        rightPointer: 4,
                        lengthOfQuestions: res.data.length,
                    })
                }
            })
            .catch(err => {
                this.setState({questions: []});
            });
    }

    //Props will be the value of the search bar
    //Will retyrn a arrat of question objects to pass to the render()
    basicSearch(searchValueArr){
        



        console.log((searchValueArr))
        //Regex to extract tags and other search terms
        let searchArray = searchValueArr.match(/\[[^\]]+\]|[^ ]+/g);
    
        //console.log(searchArray)

        if(searchArray == null){
            return null
        }
        
        //Old naming of variable from homework1, its not a set of indexes not, but rather it is a set of question objects
        let indexOfMatchedQuestions = new Set([])

        for(let x of searchArray){
          //Iterate through words submitted by user 
          
      
          //If it is a tag
          if(x.charAt(0) === '['){
            //Loop through the tags to match search term and id
            for(let y of this.state.tags){
              //Extract tag from search [] box
              let tempCompare = x.substring(1,x.length-1)
              //console.log(tempCompare)
              //If search term matches a tag name, remember the id, making them case insensitive
              if(tempCompare.toLowerCase() === y.name.toLowerCase()){
                //console.log("matched")
                let idRemember = y._id
                //Search through questions that have id
                for(let z in this.state.questions){
                  //If idRemember matches an id add the index number to the set
                  if(this.state.questions[z].tags.includes(idRemember)){
                    indexOfMatchedQuestions.add(this.state.questions[z])
                  }
                }
              }
            }
      
      
      
          } 
          //If normal term search through question text or title contains that word
          else {
            //Iterate through all questions
            for(let z in this.state.questions){
      
      
              //Per question, check if word is included in text or title
              
              //First split title into array from seperating by spaces 
              
              //Lowercase the title and then split it into an array
              let lowerCaseTitle = this.state.questions[z].title.toLowerCase()
              let titleArray = lowerCaseTitle.split(" ")
      
              if(titleArray.includes(x.toLowerCase())){
                //If present as a word then add question to set
                indexOfMatchedQuestions.add(this.state.questions[z])
              }
      
              //Now to check the question text, using the same method
      
              let lowerCaseText = this.state.questions[z].text.toLowerCase()
              let textArray = lowerCaseText.split(" ")
      
              if(textArray.includes(x.toLowerCase())){
                indexOfMatchedQuestions.add(this.state.questions[z])
              }
      
            }
      
      
          }
      
          
        }

        
        return indexOfMatchedQuestions
    
    }

    handlePrevious(questionItemLength) {
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

    handleNext(questionItemLength) {
        if (this.state.leftPointer + 5 > questionItemLength) {
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
        var questionItems;
        let returnedSet = this.basicSearch(this.props.searchValue)
        //First if is for the case that its just search result, not button pressed. Second is if button pressed
        let questionItemLength;
        if(this.props.setting === "default") {
            console.log("default")
            if(returnedSet == null || returnedSet.size === 0){
                questionItems = "No Questions Found"
                questionItemLength = 0
            } 
            else{
                console.log(returnedSet)
                let questions = []
                returnedSet.forEach(value => questions.push(value))
                if (this.state.lengthOfQuestions <= 5){
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
                
                questionItemLength = questions.length
            }
        } else {
            let questions = this.state.questions;

            if(this.props.setting === "sortByNewest" || this.props.setting === "default"){
                questions = sortByNewest(questions);
            } else if(this.props.setting === "sortByActive") {
                questions = sortByActive(questions);
            }
            else if(this.props.setting === "sortByUnanswered") {
                questions = sortByUnanswered(questions);
                console.log("sorted by unanswered")
                console.log(questions)
            } else {
                questions = sortByNewest(questions);
            }

    
            if (this.state.lengthOfQuestions <= 5){
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
            
            questionItemLength = questions.length
        }

        return (
            <div className="content-list">
                <BottomHeader PageManager={this.props.PageManager} changeSortingSetting={this.props.changeSortingSetting} numOfQuestions = {questionItemLength}/>
                {questionItems}
                <div className="scroll-buttons">
                    <button onClick={() => this.handlePrevious(questionItemLength)}>Prev</button>
                    <button onClick={() => this.handleNext(questionItemLength)}>Next</button>
                </div>
            </div>
        );
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
    render() {
        return (
            <section className="bottom-header">
                <h2>{this.props.numOfQuestions === 1 ? "1 question" : this.props.numOfQuestions + " questions"}</h2>
                <SortButtons PageManager={this.props.PageManager} changeSortingSetting = {this.props.changeSortingSetting}/>
            </section>
        );
    }
}

class SortButtons extends React.Component {

    render() {
        return (
            <div className="sort-buttons">
                <SortButton PageManager={this.props.PageManager} 
                    changeSortingSetting = {this.props.changeSortingSetting} name="Newest" />
                <SortButton PageManager={this.props.PageManager} 
                    changeSortingSetting = {this.props.changeSortingSetting} name="Active" />
                <SortButton PageManager={this.props.PageManager} 
                    changeSortingSetting = {this.props.changeSortingSetting} name="Unanswered" />
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

    render() {
        return (
            //<button onClick = {() => this.handleNewest("sortBy"+this.props.name)} id ={"sortBy"+this.props.name}>{this.props.name}</button>
            <button onClick = {() => this.props.PageManager.updatePage("home page", "sortBy"+this.props.name)}>{this.props.name}</button>

        )
    }
}