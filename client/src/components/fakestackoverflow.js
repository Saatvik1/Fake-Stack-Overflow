import axios from 'axios';

import React from 'react';
import HomePage from './homepage.js';
import SearchResultPage from './searchresults.js'
import AskQuestionPage from './askquestionpage.js';
import TagPage from './tagpage.js';
import AnswerPage from './answerpage.js';
import AddAnswerPage from './addanswerpage.js';
import WelcomePage from './welcomepage.js';
import LoginPage from './loginpage.js';
import UserProfilePage from './userprofilepage.js';

export default class fakeStackOverflow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {pageName: "welcome page", pageArgs: undefined, userSession: null};
    this.updatePage = this.updatePage.bind(this);
    this.updateUser = this.updateUser.bind(this);
  }

  componentDidMount() {
    axios.get("http://localhost:8000/user/get_session")
      .then(res => {
        const newSession = res.data
        if(this.state.userSession === null || this.state.userSession.accName !== newSession.accName) {
          const stateCallback = (pageName, userSession) => {
            return { pageName: pageName, userSession: userSession }
          }
          if(!newSession) {
            this.setState(stateCallback("welcome page", newSession))
          } else {
            this.setState(stateCallback("home page", newSession))
          }
        }
      })
      .catch(err => {
        console.error(`Get user session error from componentDidMount(): ${err}`)
      })
  }

  componentDidUpdate() {
    axios.get("http://localhost:8000/user/get_session")
      .then(res => {
        const newSession = res.data
        if(this.state.userSession === null || this.state.userSession.accName !== newSession.accName) {
          const stateCallback = (pageName, userSession) => {
            return { pageName: pageName, userSession: userSession }
          }

          if(!newSession) {
            this.setState(stateCallback("welcome page", newSession))
          } else {
            this.setState({ userSession: newSession })
          }
        }
      })
      .catch(err => {
        console.error(`Get user session error from componentDidUpdate(): ${err}`)
      })
  }

  updatePage = (function () {
    let prevPageArgs = undefined;
    return function (newPageName, ...newPageArgs) {
      if (newPageArgs.length > 0) {
        prevPageArgs = newPageArgs;
      }
      const stateCallback = (newPageName, newPageArgs) => {
        return { pageName: newPageName, pageArgs: newPageArgs };
      }
      this.setState(stateCallback(newPageName, prevPageArgs));
    };
  })(); 

  async updateUser(updatedUser) {
    await axios.post("http://localhost:8000/user/login", updatedUser)
      .then(res => {
        this.setState({ userSession: res.data })
      })
      .catch(err => {
        console.error(`The user could not be updated properly. ${err}`)
        return;
      })
  }

  render() {
    const PageManager = {
      pageName: this.state.pageName, 
      pageArgs: this.state.pageArgs, 
      updatePage: this.updatePage
    };

    const UserManager = {
      user: this.state.userSession,
      updateUser: this.updateUser
    }

    /* If there is not a user session, then render either the welcome page or login page. */
    if (!this.state.userSession) {
      switch (PageManager.pageName) {
        case "welcome page":
          return (
            <div className='container'>
              <BannerHeader PageManager={PageManager} hasOptions={false} UserManager={UserManager} />
              <WelcomePage PageManager={PageManager} />
            </div>
          )
        case "login page":
          return (
            <div className='container'>
              <BannerHeader PageManager={PageManager} hasOptions={false} UserManager={UserManager} />
              <LoginPage PageManager={PageManager} />
            </div>
          )
        default:
          return (
            <h1>Page Not Found</h1>
          );
      }
    } else {
      return (
            <div className="container">
              <BannerHeader PageManager={PageManager} hasOptions={true} UserManager={UserManager} />
              <MainBody PageManager={PageManager} UserManager={UserManager} />
            </div>
      )
    }
  }
}

class MainBody extends React.Component {
  render() {
    return (
      <div className="main-body">
        <NavigationSide PageManager = {this.props.PageManager} />
        <ContentPage PageManager = {this.props.PageManager} UserManager = {this.props.UserManager} />
      </div>
    )
  }
}


class BannerHeader extends React.Component {
  constructor(props){
    super(props);
    this.handleEnter = this.handleEnter.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.count = 0
  }


  handleEnter = (event) =>{
    if (event.key === "Enter"){
      const searchValInitial = document.getElementById("search-input").value
      //console.log(this.count)
      this.props.PageManager.updatePage("search result page", searchValInitial, this.count);
      this.count++
    }
  }

  handleLogout = () => {
    axios.post("http://localhost:8000/user/logout", this.props.UserManager.user)
      .then(res => {
        this.props.PageManager.updatePage("welcome page")
      })
      .catch(err => {
        console.error(`handleLogout error: ${err}`)
        window.alert(`Log out was unsuccessful. ${err}`);
        this.props.PageManager.updatePage("welcome page")
      })
  }
  
  render() {
    /* If the "hasOptions" prop is true, return the banner header with the search bar in place, else return without it. */
    if(this.props.hasOptions) {
      return (
        <div className="banner-header">
          <button onClick={this.handleLogout}>{this.props.UserManager.user.accName === "guest" ? "Go back to Welcome Page" : "Log Out"}</button>
          <h1>Fake Stack Overflow</h1>
          <input onKeyDown = {this.handleEnter} type="text" id="search-input" placeholder="Search..."></input>
        </div>
      )
    } else {
      return (
        <div className="banner-header">
          <h1>Fake Stack Overflow</h1>
        </div>
      )
    }
  }
}

/* The NavigationSide will contains buttons that will go to some of the pages on this website. */
class NavigationSide extends React.Component {
  constructor(props) {
    super(props)
    this.goToHomePage = this.goToHomePage.bind(this);
    this.goToTagsPage = this.goToTagsPage.bind(this);
    this.goToUserProfilePage = this.goToUserProfilePage.bind(this);
  }

  goToHomePage() {
    this.props.PageManager.updatePage("home page");
  }

  goToTagsPage() {
    this.props.PageManager.updatePage("tags page");
  }

  goToUserProfilePage() {
    this.props.PageManager.updatePage("user profile page");
  }

  render() {
    return (
      <div className="nav-side">
        <div className="nav-buttons">
          <NavigationButton PageManager={this.props.PageManager} 
            name="Questions" onClick={this.goToHomePage} 
            pageNames={["home page", "search results page"]} />
          <NavigationButton PageManager={this.props.PageManager} 
            name="Tags" onClick={this.goToTagsPage} 
            pageNames={["tags page"]} />
          <NavigationButton PageManager={this.props.PageManager} 
            name="User Profile" onClick={this.goToUserProfilePage} 
            pageNames={["user profile page"]} />
        </div>
      </div>
    ) 
  }
}

/* A NavigationButton will be highlighted with a background color of grey if the website is on a specific page. */
class NavigationButton extends React.Component {
  constructor(props) {
    super(props);
    this.setColor = this.setColor.bind(this);
  }

  setColor(pageName) {
    for(let i = 0; i < this.props.pageNames.length; i++) {
      if(pageName === this.props.pageNames[i])
        return "grey";
    }
    return "unset";
  }

  render() {
    const currentBackgroundColor = this.setColor(this.props.PageManager.pageName);

    return (
      <button style={{backgroundColor: currentBackgroundColor}} 
      onClick={this.props.onClick}>
        {this.props.name}
      </button>
    )
  }
}

/* This section of the website will be made dynamically using Javascript. */
class ContentPage extends React.Component {
  constructor(props) {
    super(props)
    this.getPageElement = this.getPageElement.bind(this);
  }

  getPageElement(PageManager) {
    switch (PageManager.pageName) {
      case "home page": return <HomePage
        PageManager={PageManager}
        passedSort={PageManager.pageArgs}
        UserManager={this.props.UserManager}
      />
      case "search result page": return <SearchResultPage
        PageManager={PageManager}
        searchValue={PageManager.pageArgs[0]}
        tick={PageManager.pageArgs[1]}
        UserManager={this.props.UserManager}
      />
      /* NOTE: For the AskQuestionPage, the editMode prop is false if it is 0, and true if it's 1. 
       * Additionally, if editMode === 0, no need to worry about the question prop.
       */
      case "ask question page": return <AskQuestionPage
        PageManager={PageManager}
        UserManager={this.props.UserManager}
        editMode={PageManager.pageArgs !== undefined ? PageManager.pageArgs[0] : 0}
        question={PageManager.pageArgs !== undefined ? PageManager.pageArgs[1] : ""}
      />
      case "tags page": return <TagPage PageManager={PageManager} UserManager={this.props.UserManager}/>
      case "answer page": return <AnswerPage
        PageManager={PageManager}
        qKey={PageManager.pageArgs[0]}
        UserManager={this.props.UserManager}
      />
      case "add answer page": return <AddAnswerPage
        PageManager={PageManager}
        qid={PageManager.pageArgs[0]._id}
        qanswers={PageManager.pageArgs[0].answers}
        UserManager={this.props.UserManager}
      />
      case "user profile page": return <UserProfilePage
        PageManager={PageManager}
        UserManager={this.props.UserManager}
      />
      default: return <h1>Page Not Found</h1>
    }
  };

  render() {
    const pageElement = this.getPageElement(this.props.PageManager);

    return (
      <div className="content-side" id="content-body">
        {pageElement}
      </div>
    );
  }
}