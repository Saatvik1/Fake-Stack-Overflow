import "../stylesheets/welcome_page.css"

import React from "react";
import axios from "axios";
import { removeErrorTexts, displayErrorText } from "../utilities/display_error_functions"

export default class WelcomePage extends React.Component {
    render() {
        return <WelcomeContainer PageManager={this.props.PageManager} />
    }
}

class WelcomeContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { registerVisible: false };
        this.toggleRegisterState = this.toggleRegisterState.bind(this);
    }

    toggleRegisterState() {
        this.setState({ registerVisible: !this.state.registerVisible })
    }

    render() {
        const RegisterFormState = {
            registerVisible: this.state.registerVisible,
            toggleRegisterState: this.toggleRegisterState
        }

        return (
            <div>
                <div className="welcome-container">
                    <WelcomeText />
                    <WelcomeButtons PageManager={this.props.PageManager} RegisterFormState={RegisterFormState} />
                </div>
                <RegisterForm PageManager={this.props.PageManager} RegisterFormState={RegisterFormState} />
            </div>
        )
    }
}

class WelcomeText extends React.Component {
    render() {
        return (
            <div>
                <h1>Welcome to Fake Stack Overflow</h1>
                <p style={{ textAlign: "center" }}>How would you like to enter?</p>
            </div>
        )
    }
}

class WelcomeButtons extends React.Component {
    constructor(props) {
        super(props)
        this.handleLogin = this.handleLogin.bind(this)
        this.handleRegister = this.handleRegister.bind(this)
        this.handleGuest = this.handleGuest.bind(this)
    }

    handleLogin() {
        this.props.PageManager.updatePage("login page");
    }

    handleRegister() {
        this.props.RegisterFormState.toggleRegisterState();
    }

    /* This simply logs the user in with the accName being "guest". */
    handleGuest() {
        const guestUser = { accName: "guest" }
        axios.post("http://localhost:8000/user/login", guestUser)
            .then(res => {
                this.props.PageManager.updatePage("home page");
            })
            .catch(err => {
                console.log(err)
            })
    }

    render() {
        return (
            <div className="welcome-options">
                <button onClick={this.handleLogin}>Login as Existing User</button>
                <button onClick={this.handleRegister}>Register as New User</button>
                <button onClick={this.handleGuest}>Continue as Guest</button>
            </div>
        )
    }
}

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.registerFormEvent = this.registerFormEvent.bind(this);
    }

    async registerFormEvent(event) {
        await event.preventDefault();
        console.log("Register Form");

        /* Access form data */
        const username = await document.getElementById("username-input").value;
        const email = await document.getElementById("email-input").value;
        const secretPassword = await document.getElementById("secret-password-input").value;
        const verifyPassword = await document.getElementById("verify-password-input").value;

        /* Verify the data */
        removeErrorTexts();
        const hasError = await verifyUserData(username, email, secretPassword, verifyPassword);
        if (hasError) {
            const errorTextList = document.querySelectorAll(".error-text");
            errorTextList.forEach(errorText => {
                errorText.style.textAlign = "center";
            })
            const registerForm = document.getElementById("register-form");
            registerForm.reset();
            return;
        }

        /* Process the data to make a new user and change the page to be login. */
        const newUser = {
            username: username,
            password: secretPassword,
            accName: email
        };

        await axios.post('http://localhost:8000/create_model/user', newUser)
            .then(res => {
                console.log("User with id = \"" + res.data._id + "\" was successfully added.");
            })
            .catch(err => {
                console.log(err);
                const newQuestionForm = document.getElementById("register-form");
                newQuestionForm.reset();
                return;
            });

        this.props.PageManager.updatePage("login page");
    }

    render() {
        return (
            <form
                style={{ display: this.props.RegisterFormState.registerVisible ? "flex" : "none" }}
                id="register-form"
                action="/submit" onSubmit={this.registerFormEvent} method="post"
            >
                <h1>Register Form</h1>
                <div className="register-fields">
                    <UsernameField />
                    <EmailField />
                    <PasswordField />
                </div>
                <input type="submit" id="signup-button" value={"Sign Up"}></input>
            </form>
        )
    }
}

function UsernameField() {
    return (
        <div>
            <h1>Username*</h1>
            <input type="text" id="username-input"></input>
        </div>
    )
}

function EmailField() {
    return (
        <div>
            <h1>Email*</h1>
            <input type="email" id="email-input"></input>
        </div>
    )
}

function PasswordField() {
    return (
        <div>
            <h1>Password*</h1>
            <input type="password" id="secret-password-input"></input>
            <h1>Verify Password*</h1>
            <input type="password" id="verify-password-input"></input>
        </div>
    )
}

/* Note: If there's an error here, display it on the website. */
async function verifyUserData(username, email, secretPassword, verifyPassword) {
    let hasError = false;

    /* Check if these fields are empty in general. */
    if (username.length < 1) {
        hasError = true;
        const errorMsg = "The username is empty.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "username-input");
    }

    if (email.length < 1) {
        hasError = true;
        const errorMsg = "The email is empty.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "email-input");
    }

    if (secretPassword.length < 1) {
        hasError = true;
        const errorMsg = "The secret password is empty.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "secret-password-input");
    }

    if (verifyPassword.length < 1) {
        hasError = true;
        const errorMsg = "The password verification is empty.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "verify-password-input");
    }

    /* If the email field is not empty, check for the following: */
    if (email !== "") {

        /* Check if the email has a valid form if the email is not empty, i.e. test@example.com */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            hasError = true;
            const errorMsg = `The email "${email}" does not have a valid format.`;
            console.log(errorMsg);
            displayErrorText(errorMsg, "email-input");
        }

        /* Check if the email here is already in the database. "No two users can create an account with the same email." */
        let user;
        const emailField = encodeURIComponent(email);
        await axios.get(`http://localhost:8000/get_by_fields/user?accName=${emailField}`)
            .then(res => {
                user = res.data;
            })
            .catch(err => {
                console.log(err);
                hasError = true;
                const errorMsg = "The server could not obtain all of the emails.";
                displayErrorText(errorMsg, "email-input")
            })

        if (user) {
            hasError = true;
            const errorMsg = `The email "${email}" is already in the system. You can't use the same email for another account`;
            console.log(errorMsg);
            displayErrorText(errorMsg, "email-input");
        }
    }

    /* Check if the password does not contain the username or the email id (the portion of the email before the @ sign) */
    const lowercaseEmail = email.toLowerCase();
    const lowercaseUsername = username.toLowerCase();

    const containsUsername = lowercaseUsername !== "" ? secretPassword.toLowerCase().includes(lowercaseUsername) : false;
    const containsEmail = lowercaseEmail !== "" ? secretPassword.toLowerCase().includes(lowercaseEmail.split("@")[0]) : false;

    if (containsUsername || containsEmail) {
        hasError = true;
        const errorMsg = "The secret password contains either your username or email id!";
        console.log(errorMsg);
        displayErrorText(errorMsg, "secret-password-input");
    }

    /* Check if the secret password and the verify password match. */
    if (secretPassword !== verifyPassword) {
        hasError = true;
        const errorMsg = "The secret password and the verify password do not match.";
        console.log(errorMsg);
        displayErrorText(errorMsg, "verify-password-input");
    }

    return hasError;
}