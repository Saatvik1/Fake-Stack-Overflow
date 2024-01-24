import '../stylesheets/user_profile_page.css'

import React from "react";
import axios from 'axios';
import { displayTimeSinceMember } from '../utilities/date_helper_functions';

export default class UserProfilePage extends React.Component {
    constructor(props) {
        super(props)

        this.state = { contentDisplay: "user questions" }
        this.updateContentDisplay = this.updateContentDisplay.bind(this)
    }

    updateContentDisplay(newContentDisplay) {
        this.setState({ contentDisplay: newContentDisplay })
    }

    render() {
        const UserContentManager = {
            contentDisplay: this.state.contentDisplay,
            updateContentDisplay: this.updateContentDisplay
        }       


        /* If the user is logged in, display all of its functionalities */
        switch (this.props.UserManager.user.accName) {
            /* If the user is a guest, display a message related to needing to be logged in to view this page. */
            case "guest":
                return <h1 style={{ paddingLeft: "20px" }}>You need to be logged in to view this page.</h1>
            default:
                /* If the user is an admin, display the admin tools */
                if (this.props.UserManager.user.admin) {
                    return (
                        <div className="user-profile-container">
                            <UserMenu UserManager={this.props.UserManager} UserContentManager={UserContentManager} />
                            <UserInformation UserManager={this.props.UserManager} />
                            <UserContent
                                PageManager={this.props.PageManager}
                                UserContentManager={UserContentManager}
                                UserManager={this.props.UserManager}
                            />
                        </div>
                    )
                } else {
                    return (
                        <div className="user-profile-container">
                            <UserMenu UserManager={this.props.UserManager} UserContentManager={UserContentManager} />
                            <UserInformation UserManager={this.props.UserManager} />
                            <UserContent
                                PageManager={this.props.PageManager}
                                UserContentManager={UserContentManager}
                                UserManager={this.props.UserManager}
                            />
                        </div>
                    )
                }
        }
    }
}

class UserMenu extends React.Component {
    constructor(props) {
        super(props)

        this.displayUserList = this.displayUserList.bind(this)
        this.displayUserQuestions = this.displayUserQuestions.bind(this)
        this.displayUserTags = this.displayUserTags.bind(this)
        this.displayUserAnswers = this.displayUserAnswers.bind(this)
    }

    displayUserList() {
        this.props.UserContentManager.updateContentDisplay("user list")
    }

    displayUserQuestions() {
        this.props.UserContentManager.updateContentDisplay("user questions")
    }
    
    displayUserTags() {
        this.props.UserContentManager.updateContentDisplay("user tags")
    }

    displayUserAnswers() {
        this.props.UserContentManager.updateContentDisplay("user answers")
    }
    
    render() {
        if (this.props.UserManager.user.admin) {
            return (
                <div className="user-nav-buttons">
                    <UserNavButton UserContentManager={this.props.UserContentManager}
                        name="User List" onClick={this.displayUserList}
                        pageNames={["user list"]} />
                    <UserNavButton UserContentManager={this.props.UserContentManager}
                        name="User Questions" onClick={this.displayUserQuestions}
                        pageNames={["user questions"]} />
                    <UserNavButton UserContentManager={this.props.UserContentManager}
                        name="User Tags" onClick={this.displayUserTags}
                        pageNames={["user tags"]} />
                    <UserNavButton UserContentManager={this.props.UserContentManager}
                        name="User Answers" onClick={this.displayUserAnswers}
                        pageNames={["user answers"]} />
                </div>
            )
        }

        return (
            <div className="user-nav-buttons">
                <UserNavButton UserContentManager={this.props.UserContentManager}
                    name="User Questions" onClick={this.displayUserQuestions}
                    pageNames={["user questions"]} />
                <UserNavButton UserContentManager={this.props.UserContentManager}
                    name="User Tags" onClick={this.displayUserTags}
                    pageNames={["user tags"]} />
                <UserNavButton UserContentManager={this.props.UserContentManager}
                    name="User Answers" onClick={this.displayUserAnswers}
                    pageNames={["user answers"]} />
            </div>
        )
    }
}

class UserNavButton extends React.Component {
    constructor(props) {
        super(props);
        this.setColor = this.setColor.bind(this);
    }

    setColor(pageName) {
        for (let i = 0; i < this.props.pageNames.length; i++) {
            if (pageName === this.props.pageNames[i])
                return "grey";
        }
        return "unset";
    }

    render() {
        const currentBackgroundColor = this.setColor(this.props.UserContentManager.contentDisplay);

        return (
            <button style={{ backgroundColor: currentBackgroundColor }}
                onClick={this.props.onClick}>
                {this.props.name}
            </button>
        )
    }
}

class UserInformation extends React.Component {
    render() {
        return (
            <div className="user-info">
                <h1>{this.props.UserManager.user.username} Profile Page</h1>
                <h3>Member for {displayTimeSinceMember(this.props.UserManager.user)}</h3>
                <h3>Reputation: {this.props.UserManager.user.reputation}</h3>
            </div>
        )
    }
}

class UserContent extends React.Component {
    constructor(props) {
        super(props)

        this.selectDisplayComponent = this.selectDisplayComponent.bind(this)
    }

    selectDisplayComponent() {
        switch (this.props.UserContentManager.contentDisplay) {
            case "user list":
                if (this.props.UserManager.user.admin)
                    return <UserListDisplay
                        PageManager={this.props.PageManager}
                        UserManager={this.props.UserManager}
                        UserContentManager={this.props.UserContentManager}
                    />
                break;
            case "user questions":
                return <UserQuestionsDisplay PageManager={this.props.PageManager} UserManager={this.props.UserManager} />
            case "user tags":
                return <UserTagsDisplay PageManager={this.props.PageManager} UserManager={this.props.UserManager} />
            case "user answers":
                return <UserAnswersDisplay PageManager={this.props.PageManager} UserManager={this.props.UserManager} />
            default:
                return <h1>Content not found</h1>
        }
    }

    render() {
        const displayComponent = this.selectDisplayComponent()
        return (
            <div className="user-content">
                {displayComponent}
            </div>
        )
    }
}

class UserQuestionsDisplay extends React.Component {
    constructor(props) {
        super(props)
        this.state = { userQuestions: [] }
    }

    async componentDidMount() {
        const questionIds = this.props.UserManager.user.questions;
        await axios.post("http://localhost:8000/user/get_questions", questionIds)
            .then(res => {
                this.setState({ userQuestions: res.data })
            })
            .catch(err => {
                console.error(`Question display error in user profile page. ${err}`)
                window.alert(err)
            })
    }

    render() {
        if (this.state.userQuestions.length < 1)
            return <h1>Loading...</h1>
        
        const userQuestionItems = this.state.userQuestions.map((question) =>
            <UserQuestion key={question._id} PageManager={this.props.PageManager} question={question} />
        );
        return (
            <div className="user-question-list">
                {userQuestionItems}
            </div>
        )
    }
}

class UserQuestion extends React.Component {
    constructor(props) {
        super(props)

        this.modifyQuestion = this.modifyQuestion.bind(this)
    }

    modifyQuestion() {
        console.log(`modifying question ${this.props.question._id}`)
        this.props.PageManager.updatePage("ask question page", 1, this.props.question);
    }

    render() {
        return (
            <div className="user-question">
                <a href={"#" + this.props.question.url} onClick={this.modifyQuestion}>{this.props.question.title}</a>
            </div>
        )
    }
}

class UserTagsDisplay extends React.Component {
    constructor(props) {
        super(props)
        this.state = { userTags: [] }
    }

    componentDidMount() {
        const tagIds = this.props.UserManager.user.tags;
        axios.post("http://localhost:8000/user/get_tags", tagIds)
            .then(res => {
                this.setState({ userTags: res.data })
            })
            .catch(err => {
                console.error(`Question display error in user profile page. ${err}`)
                window.alert(err)
            })
    }

    render() {
        if (this.state.userTags.length < 1)
            return <h1>Loading...</h1>
        
        const userTagItems = this.state.userTags.map((tag) =>
            <UserTag 
                key={tag._id} 
                PageManager={this.props.PageManager} 
                UserManager={this.props.UserManager} 
                updateTags={this.updateTags}
                tag={tag} 
            />
        );
        return (
            <div className="user-question-list">
                {userTagItems}
            </div>
        )
    }
}

class UserTag extends React.Component {
    constructor(props) {
        super(props)

        this.state = { is_used: false, tag: this.props.tag }
        this.modifyTag = this.modifyTag.bind(this)
        this.deleteTag = this.deleteTag.bind(this)
    }

    async componentDidMount() {
        let tag_used = false;

        /* Check if this tag is being used by other questions (*except for the logged user's questions*) or not. */
        let questionList;
        await axios.get("http://localhost:8000/get/questions")
            .then(res => {
                questionList = res.data;
            })
            .catch(err => {
                console.error(`There's been an error in obtaining all questions. ${err}`)
                tag_used = true;
                this.setState({ is_used: true })
            })
        
        if (tag_used)
            return;
        
        await questionList.forEach((question) => {
            const in_use = !this.props.UserManager.user.questions.includes(question._id)
                && question.tags.includes(this.state.tag._id);
            
            if (in_use) {
                tag_used = true;
                this.setState({ is_used: true });
            }
        });

        if (tag_used)
            return;

        this.setState({ is_used: false })
    }

    async modifyTag() {
        console.log(`modify tag ${this.state.tag._id}`)
        if (!this.state.is_used) {
            console.log(`The tag ${this.state.tag.name} can be modified.`)
            let nameField = document.getElementById(`modify-tag-${this.state.tag._id}`).value;
            nameField = encodeURIComponent(nameField)
            if (nameField !== '') {
                await axios.put(`http://localhost:8000/update/tag/${this.state.tag._id}`, {name: nameField})
                    .then(res => {
                        console.log(`The tag ${this.state.tag.name} has been updated to ${res.data.name}`)
                        this.setState({ tag: res.data })
                    })
                    .catch(err => {
                        console.error(`Error in modifying tag. ${err}`)
                        window.alert(`The server couldn't modify this tag. Please try again. ${err}`)
                    })
            } else {
                window.alert("Enter the name you want to change the tag to first.")
            }
        } else {
            console.log(`The tag ${this.state.tag.name} can't be modified.`)
            window.alert(`The tag ${this.state.tag.name} can't be modified.`)
        }
    }

    async deleteTag() {
        console.log(`delete tag ${this.state.tag._id}`)
        if (!this.state.is_used) {
            console.log(`The tag ${this.state.tag.name} can be deleted.`)
            /* Note: This http request does delete the tag, however when this happens, the user also
             * needs to be updated to not have this tag as well as the user's questions. 
             */
            await axios.post(`http://localhost:8000/tag/delete_tag/${this.state.tag._id}`, this.props.UserManager.user)
                .then(res => {
                    console.log(`The tag ${res.data.deletedTag} has been successfully deleted.`);
                    this.props.UserManager.updateUser(res.data.updatedUser)
                })
                .catch(err => {
                    console.error(`Error in deleting tag. ${err}`)
                    window.alert(`The server couldn't delete this tag. Please try again. ${err}`)
                })
        } else {
            console.log(`The tag ${this.state.tag.name} can't be deleted.`)
            window.alert(`The tag ${this.state.tag.name} can't be deleted.`)
        }
    }

    render() {
        return (
            <div className="user-question">
                <div>
                    <a href={"#" + this.state.tag.url}>{this.state.tag.name}</a>
                    <button onClick={this.modifyTag}>Modify Tag</button>
                    <button onClick={this.deleteTag}>Delete Tag</button>
                    <input type="text" id={`modify-tag-${this.state.tag._id}`}></input>
                </div>
            </div>
        )
    }
}

class UserAnswersDisplay extends React.Component {
    render() {
        return <h1>User Answers Display</h1>
    }
}

class UserListDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.state = { userList: [] }
    }

    componentDidMount() {
        axios.get("http://localhost:8000/get/users")
            .then(res => {
                this.setState({ userList: res.data })
            })
            .catch(err => {
                console.error("Could not fetch all users.")
            })
    }

    render() {
        if (this.state.userList.length < 1)
            return <h1>Loading...</h1>
        
        const userItems = this.state.userList.map((user) => (
            <User 
                key={user._id}
                PageManager={this.props.PageManager} 
                UserManager={this.props.UserManager}
                UserContentManager={this.props.UserContentManager}
                mappedUser={user}
            />
        ))
        return (
            <div>
                {userItems}
            </div>
        )
    }
}

class User extends React.Component {
    constructor(props) {
        super(props)

        this.deleteAccount = this.deleteAccount.bind(this)
    }

    async deleteAccount() {
        console.log(`Deleting account with email ${this.props.mappedUser.accName}`)
        let warningResult = window.confirm(`Warning! You are about to delete the user ${this.props.mappedUser.accName}. Are you sure you want to continue?`)
        if (!warningResult) {
            console.log("Aborting deletion.")
            return;
        }

        console.log("You are about to delete a user.")
        await axios.post(`http://localhost:8000/user/delete_account/${this.props.mappedUser._id}`)
            .then(res => {
                console.log(`The user with the email ${res.data.accName} has been successfully deleted.`);
                this.props.UserContentManager.updateContentDisplay("user list");
            })
            .catch(err => {
                console.error(`The user with the email ${this.props.mappedUser.accName} could not be deleted.`);
                window.alert(`The user with the email ${this.props.mappedUser.accName} could not be deleted. Please try again later.`);
            })
    }

    render() {
        return (
            <div className="user-user" style={{paddingLeft: "20px", paddingTop: "20px"}}>
                <a href={"#" + this.props.mappedUser.url}>{this.props.mappedUser.username} : {this.props.mappedUser.accName}</a>
                <button onClick={this.deleteAccount}>Delete User Account</button>
            </div>
        )
    }
}