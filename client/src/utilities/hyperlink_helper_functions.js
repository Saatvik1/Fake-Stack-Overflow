import React from 'react';


const hyperlinkBracketsRegex = /\[(.*?)\]\((.*?)\)|(\[\]\(\))/g;
const hyperlinkContentRegex = /(\[(.*?)\]\((https?:\/\/[^\s]+)\))/;

export function hasValidHyperlink(text){
    const hyperlinks = text.match(hyperlinkBracketsRegex);
    if (!hyperlinks) {
        return true; // No hyperlinks found, no violation
    }
    
    for (const hyperlink of hyperlinks) {
        const hyperlinkContent = hyperlink.match(hyperlinkContentRegex);
        console.log(hyperlinkContent);

        if(hyperlinkContent === null)
            return false;
        
        const [hyperlinkName, hyperlinkURL] = [hyperlinkContent[2], hyperlinkContent[3]];
        if (hyperlinkName.trim() === "" || hyperlinkURL.trim() === "") {
            return false; // Hyperlink name or URL is empty
        }   
    }
    return true; // All hyperlinks are valid
}

export function convertTextWithHyperlinks(text) {
    const hyperlinks = getHyperlinksFromText(text);
    if(!hyperlinks)
        return <p>{text}</p>;
    // console.log(hyperlinks);

    /* Split the text separating the regular texts from the hyperlinks. */
    let splitText = [];
    let totalSplitTextLength = 0;
    for(let i = 0; i < hyperlinks.length; i++) {
        const currentHyperlink = hyperlinks[i];
        
        let hyperlinkIndex = text.indexOf(currentHyperlink, totalSplitTextLength);
        let textBefore;
        if(i === 0) {
            textBefore = text.slice(0, hyperlinkIndex);
            splitText.push(textBefore, currentHyperlink);
            totalSplitTextLength += textBefore.length + currentHyperlink.length;

            if(i === hyperlinks.length-1 && splitText.length !== totalSplitTextLength) {
                let textAfter = text.slice(totalSplitTextLength, -1);
                splitText.push(textAfter);
            }
        } else if(i < hyperlinks.length) {
            textBefore = text.slice(totalSplitTextLength, hyperlinkIndex);
            splitText.push(textBefore, currentHyperlink);
            totalSplitTextLength += textBefore.length + currentHyperlink.length;

            if(i === hyperlinks.length-1 && splitText.length !== totalSplitTextLength) {
                let textAfter = text.slice(totalSplitTextLength, -1);
                splitText.push(textAfter);
            }
        }
    };
    
    /* Convert the split text into a list of elements. */
    const splitElements = splitText.map((text, index) => {
        let textElement;
        if(isHyperlink(text)) {
            let hyperlinkContent = getHyperlinkContent(text);
            textElement = <a target = "blank_" key={index} href={hyperlinkContent.hyperlinkURL}>{hyperlinkContent.hyperlinkName}</a>
        }
        else
            textElement = text;
        return textElement;
    })

    return (
        <p>{splitElements}</p>
    );
}

function getHyperlinksFromText(text) {
    return text.match(hyperlinkBracketsRegex);
}

function getHyperlinkContent(hyperlink) {
    const hyperlinkContent = hyperlink.match(hyperlinkContentRegex);
    return {hyperlinkName: hyperlinkContent[2], hyperlinkURL: hyperlinkContent[3]};
}

function isHyperlink(text) {
    return hyperlinkContentRegex.test(text);
}
