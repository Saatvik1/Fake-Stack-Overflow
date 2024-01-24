/* Helper functions for correctly displaying the date from homework 1. */
export function getDateDisplay(dateString) {
    let date = new Date(dateString);
    const currentTimeSec = Math.floor(Date.now() / 1000);
    const dateSec = Math.floor(date.valueOf() / 1000);
    const timeDiffSec = currentTimeSec - dateSec;

    /* If the difference is less than a minute. */
    if(timeDiffSec < 60)
        return ((timeDiffSec === 1) ? timeDiffSec + " second ago" : timeDiffSec + " seconds ago");

    /* If the difference is less than an hour. */
    if(timeDiffSec < 3600) {
        const timeDiffMinutes = Math.floor(timeDiffSec / 60);
        return ((timeDiffMinutes === 1) ? timeDiffMinutes + " minute ago" : timeDiffMinutes + " minutes ago");
    }

    /* If the difference is less than a day. */
    if(timeDiffSec < 86400) {
        const timeDiffHours = Math.floor(timeDiffSec / 3600);
        return ((timeDiffHours === 1) ? timeDiffHours + " hour ago" : timeDiffHours + " hours ago");
    }

    /* Get exact time. */
    let dateHours = date.getHours();
    let dateMinutes = date.getMinutes();
    if(dateHours < 10)
        dateHours = dateHours.toString().padStart(2, "0");
    if(dateMinutes < 10)
        dateMinutes = dateMinutes.toString().padStart(2, "0")

    /* Display exact date (excluding year if difference is less than a year) */
    if(timeDiffSec < 31536000)
        return "on " + getMonthWord(date.getMonth()) + " " + date.getDate() + " at " + dateHours + ":" + dateMinutes;
    return "on " + getMonthWord(date.getMonth()) + " " + date.getDate() + ", " + date.getFullYear() + " at " + dateHours + ":" + dateMinutes;
}

export function displayTimeSinceMember(user) {
    const date = new Date(user.accCreation);
    const currentTimeSec = Math.floor(Date.now() / 1000);
    const dateSec = Math.floor(date.valueOf() / 1000);
    const timeDiffSec = currentTimeSec - dateSec;

    /* If the difference is less than a minute. */
    if (timeDiffSec < 60)
        return ((timeDiffSec === 1) ? timeDiffSec + " second" : timeDiffSec + " seconds");

    /* If the difference is less than an hour. */
    if (timeDiffSec < 3600) {
        const timeDiffMinutes = Math.floor(timeDiffSec / 60);
        return ((timeDiffMinutes === 1) ? timeDiffMinutes + " minute" : timeDiffMinutes + " minutes");
    }

    /* If the difference is less than a day. */
    if (timeDiffSec < 86400) {
        const timeDiffHours = Math.floor(timeDiffSec / 3600);
        return ((timeDiffHours === 1) ? timeDiffHours + " hour" : timeDiffHours + " hours");
    }

    /* If the difference is less than a week. */
    if (timeDiffSec < 604800) {
        const timeDiffWeeks = Math.floor(timeDiffSec / 86400)
        return ((timeDiffWeeks === 1) ? timeDiffWeeks + " week" : timeDiffWeeks + " week")
    }

    /* If the difference is less than a month. */
    if (timeDiffSec < 2.628e+6) {
        const timeDiffMonths = Math.floor(timeDiffSec / 604800)
        return ((timeDiffMonths === 1) ? timeDiffMonths + " week" : timeDiffMonths + " week")
    }

    /* If the difference is less than a year. */
    if (timeDiffSec < 3.154e+7) {
        const timeDiffMonths = Math.floor(timeDiffSec / 2.628e+6)
        return ((timeDiffMonths === 1) ? timeDiffMonths + " week" : timeDiffMonths + " week")
    }
    
}

function getMonthWord(monthVal) {
    return {
        0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr",
        4: "May", 5: "Jun", 6: "Jul", 7: "Aug",
        8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec"
    }[monthVal];
}