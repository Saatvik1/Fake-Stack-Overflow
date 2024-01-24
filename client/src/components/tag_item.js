import "../stylesheets/tag.css"

import React from "react";
import axios from "axios";

export default class Tag extends React.Component {
    constructor(props){
        super(props)
        this.state = { numQuestions: 0 }
        this.searchPageOnTag = this.searchPageOnTag.bind(this)
    }

    componentDidMount() {
        axios.get("http://localhost:8000/get/questions")
            .then(res => {
                let questions = res.data;
                let questionsForTag = questions.filter((question) => {
                    let tagFound = question.tags.find((tagId) => tagId === this.props.tagid);
                    return tagFound !== undefined;
                });
                // console.log("Number of questions for the tag " + this.props.tagName + ": " + questionsForTag.length);
                this.setState({numQuestions: questionsForTag.length})
            })
            .catch(err => {
                console.log("No questions for the tag " + this.props.tagName + ".");
                this.setState({numQuestions: 0});
            });
    }
      
    searchPageOnTag() {
        this.props.PageManager.updatePage("search result page", "[" + this.props.tagName + "]")
    }

    render() {
        let numQuestions = this.state.numQuestions;
        return (
            <div className="tag">
                <a href={"#" + this.props.tagUrl} onClick = {this.searchPageOnTag}>{this.props.tagName}</a>
                <h2>{numQuestions === 1 ? "1 question" : numQuestions + " questions"}</h2>
            </div>
        )
    }
}