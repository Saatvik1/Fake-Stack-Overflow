/* These utility functions are used for removing and displaying 
 * error messages related to user creation, question creation, etc. 
 */
export function removeErrorTexts() {
    const errorTextList = document.querySelectorAll(".error-text");
    errorTextList.forEach(errorText => errorText.remove());
};

export function displayErrorText(errorMsg, elementId) {
    const errorText = document.createElement("p");
    errorText.style.width = "400px";
    errorText.style.color = "red";
    errorText.className = "error-text";
    errorText.textContent = errorMsg;
    document.getElementById(elementId).insertAdjacentElement("afterend", errorText);
};