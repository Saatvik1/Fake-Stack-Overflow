import axios from "axios";

function sortAnswers(answers){
    for(let i = 0; i<answers.length-1; i++){
      for(let j = 0; j<answers.length - i - 1; j++){
        if (answers[j].ans_date_time < answers[j + 1].ans_date_time) {
          const temp = answers[j];
          answers[j] = answers[j + 1];
          answers[j + 1] = temp;
        }
      }
    }
    return answers;
}

export function sortByNewest(questions){
    for(let i = 0; i<questions.length-1; i++){
        for(let j = 0; j<questions.length - i - 1; j++){
          if(questions[j].ask_date_time < questions[j + 1].ask_date_time) {
            const temp = questions[j];
            questions[j] = questions[j + 1];
            questions[j + 1] = temp;
          }
        }
      }    
    return questions
}

export function sortByActive(questions){
    let shouldGoLast = []
    let n = questions.length
    for(let i = 0; i<n; i++){
      let currentQuestion = questions[i];
      if(currentQuestion.answers.length === 0){
        // shouldGoLast.push(model.data.questions.splice(i,1)[0])
        // console.log(model.data.questions)
        let x = questions.splice(i,1)
        shouldGoLast.push(x[0])
        n--
        i--
        //console.log(shouldGoLast)
        //console.log(model.data.questions)
      }
    }

    for(let i = 0; i<questions.length-1; i++){
        for(let j = 0; j<questions.length - i - 1; j++){
           if (!(shouldGoBefore(questions[j], questions[j + 1]))) {
            //model.data.questions[j].askDate > model.data.questions[j + 1].askDate
            //not shouldGoBefore
            
            //console.log("swaping")
            const temp = questions[j];
            questions[j] = questions[j + 1];
            questions[j + 1] = temp;
          }
        }
      }

      shouldGoLast = sortByNewestForActive(shouldGoLast)

      questions.push(...shouldGoLast)

      return questions

}

function sortByNewestForActive(questions){
  // console.log("inside func")
  
  for(let i = 0; i<questions.length-1; i++){
      for(let j = 0; j<questions.length - i - 1; j++){
        if(questions[j].ask_date_time < questions[j + 1].ask_date_time) {
          const temp = questions[j];
          questions[j] = questions[j + 1];
          questions[j + 1] = temp;
        }
      }
    }

    //console.log(questions)
    
  
  return questions
}

async function getAnswers() {
  let answers;
  await axios.get("http://localhost:8000/get/answers")
    .then(res => {
      answers = res.data;
    })
    .catch(err => {
      answers = [];
    })
  return answers;
}

async function shouldGoBefore(question1, question2){
    let mostActiveQ1 = null
    let mostActiveQ2 = null
  
    if(question1.answers.length === 0){
      return true
    }
    if(question2.answers.length === 0){
      return true
    }

    let answers = await sortAnswers(getAnswers());

    let highestQ1Index = answers.length;
    let highestQ2Index = answers.length;
  
    //console.log(model.data.answers)
    for(let i = 0; i<question1.answers.length; i++){
      for(let j = 0; j<answers.length; j++){
        if(answers[j]._id === question1.answers[i]){
          //console.log("in here")
          if(j < highestQ1Index){
            //console.log(j)
            highestQ1Index = j
          }
        }
      }
    }
  
    for(let i = 0; i<question2.answers.length; i++){
      for(let j = 0; j<answers.length; j++){
        if(answers[j]._id === question2.answers[i]){
          if(j < highestQ2Index){
            highestQ2Index = j
          }
        }
      }
    }
  
    if(highestQ1Index === -1){
      //console.log("wor")
      return true;
    }
    if(highestQ2Index === -1){
      //console.log("wor2")
      return true;
    }
  
  
    //console.log(highestQ1Index)
    mostActiveQ1 = answers[highestQ1Index].ans_date_time
    mostActiveQ2 = answers[highestQ2Index].ans_date_time
    
  
    //console.log("Difference is:")
    //console.log(mostActiveQ1 - mostActiveQ2)
    if((mostActiveQ1 - mostActiveQ2) > 0){
      return true
    } else {
      return false
    }
  
}

export function sortByUnanswered(questions){
    let arr = []
    for(let i = 0; i<questions.length; i++){
        if(questions[i].answers.length === 0){
          arr.push(questions[i])
        }
    }

    return arr;
}

