//Importing icons from assets file 
import bot from './assets/bot.svg';
import user from './assets/user.svg';

//since no react is being used, we will target html elements manually by using document.query selector 
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// function that will load messages 
function Loader(element){
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.'; // adding dot onto loading screen every 300 ms 
    
    //checking to see if loading indicator has reached 3 dots; if so, reset text content 
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}
// Accepts element and text as paramaters in order to type responses
function typeText(element,text){
  let index = 0;
  let interval = setInterval(() => {  // second paramater will take only 20 ms for each letter in text to be generated
    //check to see whether user is still typing 
    if(index < text.length){
      element.innerHtML += text.charAt(index); //this gets character from specific index in the response AI generates
      index++;
    }
    else {
      clearInterval(interval);
    }
  },20)
}

//generates unique id for every message in order to map over them 
// necessary for typing text effect for that specific reply
function genUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);// random number with 16 characters
  
  //return an ID with template string of ID - time stamp- hexadecimal
  return `id-${timestamp}-${hexadecimalString}`;
}

//takes in whether Ai is speaking or not, the value of the message and pass it a unique ID
//returns a unique string and renders the value of AI message to screen
function chatStripe (Aispeaking, value, uniqueId) {

  return (
    `
      <div class="wrapper ${Aispeaking && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${Aispeaking ? bot : user} 
                    alt="${Aispeaking ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div> 
          </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault(); //prevents default behavior of browser reloading after every request
  
  const data = new FormData(form);
  //specifies user's chatstripe
  chatContainer.innerHTML += chatStripe(false,data.get('prompt')); //false because user is typing  

  form.reset(); //clears the text area input 

  //Ai's chatstripe 
  const uniqueId = genUniqueId(); 
  chatContainer.innerHTML += chatStripe(true," ", uniqueId); //second paramater has empty string since it will be filled up by Loader function above

  //ensures that form will continue scrolling down as user types request 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  //specific message div 
  const messageDiv = document.getElementById(uniqueId);

  //called Loader function 
  Loader(messageDiv)

  //fetch data from server -> bot's response 
  // edits how  the headers and body of response will look
  const response = await fetch('http://localhost:5000',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  }) 

  //clear interval
  clearInterval(loadInterval);
  messageDiv.innerHTML=''; //sets message div to empyty string 

  if (response.ok){
    const data = await response.json(); //giving response coming from back end 
    const parsedData = data.bot.trim(); //cutting extra information from data

    typeText(messageDiv,parsedData); //calling typeText function using messageDiv and a new parsedData 
  }else{
    const error = await response.text();
    messageDiv.innerHtML = "An error has occured";
    alert(error)
  }
}


//to see changes made to handleSubmit
form.addEventListener('submit',handleSubmit);
// incase user does enter button instead of clicking submit 
form.addEventListener('keyup', (e)=> {
  if (e.keyCode === 13){ // 13 is the enter key
    handleSubmit(e);
  }
})

//this was front technicality , now we have to create backend application that 
//will make call to the open AI's chatgpt AI
 