//setup to call open AI's API

//importing dependencies
import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration,OpenAIApi } from 'openai';

// to use dotenv variables 
dotenv.config();

console.log(process.env.OPENAI_API_KEY);

const configuration = new Configuration({    // function that accepts an object and passes an Api key 
    apiKey: process.env.OPENAI_API_KEY,
});

//creating instance of OpenAi 
const openai = new OpenAIApi(configuration);

//iniatialize express project 
const app = express();
//setting up middleware so that our server to be called in from front end as cross orgin requests  
app.use(cors());
app.use(express.json());

//futile http get request to check whether the request has a response
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello'    
    })
});

//retrieving data from body of front end request 
// takes in request and response
app.post('/',async (req,res) => {
    try {
        const prompt = req.body.prompt; //getting prompt
        const response = await openai.createCompletion({ //create a response from openApi
            model: "text-davinci-003",
            prompt: `${prompt}`, //passing prompt from front end 
            temperature: 0, // Higher values means the model will take more risks
            max_tokens: 3000, // The maximum number of tokens to generate in the completion, Ai can give long responses
            top_p: 1, // alternative to sampling with temperature
            frequency_penalty: 0.5, //  model's likelihood to repeat the same line verbatim, lower number means same sentences will rarely be used
            presence_penalty: 0, // model's likelihood to talk about new topics.
        });

        //with response, we want to send it back to the frontend side
        res.status(200).send({
            bot: response.data.choices[0].text
        })
    }catch (error){
        console.log(error);
        res.status(500).send({error})

    }
})
//to make sure server always listens for requests from client
app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));




