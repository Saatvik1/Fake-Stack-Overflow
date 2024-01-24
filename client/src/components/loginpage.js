import "../stylesheets/login_page.css"

import React from "react"
import axios from "axios"

import { removeErrorTexts, displayErrorText } from "../utilities/display_error_functions"

export default class LoginPage extends React.Component {
    render() {
        return <LoginContainer PageManager={this.props.PageManager} />
    }
}

class LoginContainer extends React.Component {
    constructor(props) {
        super(props);
        this.returnToWelcomePage = this.returnToWelcomePage.bind(this);
    }

    returnToWelcomePage() {
        this.props.PageManager.updatePage("welcome page");
    }

    render() {
        return (
            <div className="login-container">
                <button onClick={this.returnToWelcomePage}>Return to Welcome Page</button>
                <h1>Login to your Account Here</h1>
                <LoginForm PageManager={this.props.PageManager} />
            </div>
        )
    }
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.loginEvent = this.loginEvent.bind(this);
    }

    async loginEvent(event) {
        await event.preventDefault();
        console.log("Login Form");

        /* Obtain login data here. */
        const email = await document.getElementById("email-input").value;
        const password = await document.getElementById("password-input").value;

        console.log(`email = ${email}; password = ${password}`)

        /* Verify login data here. */
        removeErrorTexts()
        const hasError = await verifyLoginData(email, password);
        if (hasError) {
            const errorTextList = document.querySelectorAll(".error-text");
            errorTextList.forEach(errorText => {
                errorText.style.textAlign = "center";
                errorText.style.width = "auto";
            })
            const loginForm = document.getElementById("login-form");
            loginForm.reset();
            return;
        }

        const loginForm = document.getElementById("login-form");
        loginForm.reset();

        /* If the login data is correct, add user infor to the session and put them into the Home Page. */
        const emailField = encodeURIComponent(email);

        let user;
        await axios.get(`http://localhost:8000/get_by_fields/user?accName=${emailField}`)
            .then(res => {
                user = res.data
            })       
            .catch(err => {
                console.error(`Error from user retrieval. ${err}`)
                const errMsg = "Server could not login this user to the database. Please try again later."
                displayErrorText(errMsg, "email-input");
                const errorTextList = document.querySelectorAll(".error-text");
                errorTextList.forEach(errorText => {
                    errorText.style.textAlign = "center";
                    errorText.style.width = "auto";
                })
                const loginForm = document.getElementById("login-form");
                loginForm.reset();
                return;
            })

        await axios.post('http://localhost:8000/user/login', user, {withCredentials : true,})
            .then(res => {
                if(res.data === "success")
                    console.log("The user login is a success. Proceeding to home page...")
            })
            .catch(err => {
                console.error(`Error from login attempt. ${err}`)
                const errMsg = "Server could not login this user to the database. Please try again later."
                displayErrorText(errMsg, "email-input");
                const errorTextList = document.querySelectorAll(".error-text");
                errorTextList.forEach(errorText => {
                    errorText.style.textAlign = "center";
                    errorText.style.width = "auto";
                })
                const loginForm = document.getElementById("login-form");
                loginForm.reset();
                return;
            })
        
        this.props.PageManager.updatePage("home page")
    }

    render() {
        return (
            <form id="login-form" action="/submit" onSubmit={this.loginEvent} method="post">
                <div className="login-fields">
                    <InputField type="email" idName="email-input" placeholder="Email" />
                    <InputField type="password" idName="password-input" placeholder="Password" />
                </div>
                <input type="submit" id="login-button" value={"Login"}></input>
            </form>
        )
    }
}

function InputField(props) {
    return (
        <div style={{ width: "210px", display: "flex", flexDirection: "column", textAlign: "center" }}>
            <input type={props.type} id={props.idName} placeholder={props.placeholder}></input>
        </div>
    )
}

async function verifyLoginData(email, password) {
    let hasError = false;

    /* Verify if the email used to login is in the database. */
    let user;
    const emailField = encodeURIComponent(email);
    await axios.get(`http://localhost:8000/get_by_fields/user?accName=${emailField}`)
        .then(res => {
            user = res.data;
        })
        .catch(err => {
            console.error(`Error from verifying login data ${err}`)
            hasError = true;
            const errorMsg = `The email could not be retrieved by the server. Please try again later.`
            displayErrorText(errorMsg, "email-input")
            return hasError;
        });

    if (!user) {
        hasError = true;
        const errorMsg = `The email "${email}" is not in the database. Please register a new account.`
        displayErrorText(errorMsg, "email-input")
        return hasError;
    }

    /* Verify if the password is correct. */
    let success;
    await axios.post(`http://localhost:8000/user/verify_password?password=${password}`, user, {withCredentials : true,})
        .then(res => {
            success = res.data;
        })
        .catch( err => {
            console.log(err)
            hasError = true;
            const errorMsg = "The server could not verify if password matches. Please try again.";
            displayErrorText(errorMsg, "password-input")
            return hasError;
        })
    
    if(!success) {
        hasError = true;
        const errorMsg = "The password given is incorrect. Please try again.";
        displayErrorText(errorMsg, "password-input");
    }
    
    return hasError;
}