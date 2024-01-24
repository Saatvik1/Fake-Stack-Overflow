import "../stylesheets/tags_page.css"
import axios from "axios";
import React from "react";
import Tag from './tag_item';


export default class TagPage extends React.Component {
    render(){

        return (
            <div className="tag-page">
                <TagHeader PageManager={this.props.PageManager} UserManager={this.props.UserManager}/>
                <TagPageBody PageManager={this.props.PageManager} />
            </div>
            
        )
    }
}

class TagPageBody extends React.Component {
    constructor(props){
        super()
        this.state = {tags : [],}
    }


    componentDidMount(){
        let tagsList;
        axios.get('http://localhost:8000/get/tags')
            .then(res => {
                //console.log(res.data)
                tagsList = res.data    
                this.setState({tags: tagsList})
            })
            .catch(err => {
                this.setState({tags: []});
            });
    }

    render() {
        const tags = this.state.tags
        console.log(tags)
        const tagItems = tags.map((tag) => 
            <Tag key = {tag._id} 
                PageManager={this.props.PageManager} 
                tagName = {tag.name} 
                tagid = {tag._id}
                tagUrl = {tag.url}
            /> 
        );

        return (

            <div className = "tag-block-list">
                {tagItems}
            </div>
            
        )
    }
}


class TagHeader extends React.Component {
    constructor(props) {
        super(props);
        this.goToAskQuestionPage = this.goToAskQuestionPage.bind(this);
        this.state = { numOfTags: 0 }
    }

    componentDidMount() {
        axios.get("http://localhost:8000/get/tags")
            .then(res => {
                let tags = res.data;
                this.setState({ numOfTags: tags.length });
            })
            .catch(err => {
                console.log("Number of tags error.");
                this.setState({ numOfTags: 0 });
            });
    }

    goToAskQuestionPage() {
        this.props.PageManager.updatePage("ask question page", 0);
    }

    render() {
        if(this.props.UserManager.user.accName === "guest"){
            return (
                <section className="tag-header">
                    <h1>{this.state.numOfTags === 1 ? "1 Tag" : this.state.numOfTags + " Tags"}</h1>
                    <h1>All Tags</h1>
                </section>
            );
        } else {
            return (
                <section className="tag-header">
                    <h1>{this.state.numOfTags === 1 ? "1 Tag" : this.state.numOfTags + " Tags"}</h1>
                    <h1>All Tags</h1>
                    <button onClick={this.goToAskQuestionPage}>Ask Question</button>
                </section>
            );
        }
        
    }
}