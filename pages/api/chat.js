import OpenAI from "openai";

const axios = require("axios")

let beer

async function getBeer(food) {
    try {
        const response = await axios.get(`https://api.punkapi.com/v2/beers?food=${food}`)
        if (response.data && response.data.length > 0) {
            beer = response.data[0].name
            console.log(beer)
        } else {
            console.log("No beers found for the given food")
        }
    } catch (error) {
        console.error("Error fetching beers:", error.message)
        return "Error fetching beers."
    }
}

export default async function handler(req, res) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant",
        },
      ].concat(req.body.messages),
      functions: [
        {
            name: "getBeer",
            description: "get a beer pairing given a specific food or dish",
            parameters: {
                type: "object",
                properties: {
                    food: {
                        type: "string",
                        description: "The food, e.g. Pizza, hotdogs, fish, pasta"
                    }
                },
                required: ["food"]
            }
        }
      ],
      function_call: "auto"
    });
    const completionResponse = completion.choices[0].message
    if(completionResponse.function_call) {
        const functionCallName = completionResponse.function_call.name
        console.log(functionCallName)
        if(functionCallName === "getBeer") {
            const completionArgument = JSON.parse(completionResponse.function_call.arguments)
            console.log(completionArgument.food)
            await getBeer(completionArgument.food)
        }
    }
    const finalCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
            role: "user",
            content: `Write a few sentences explaining that ${beer} is a good pairing with the specified food.`,
            },
        ].concat(req.body.messages)
    })
    res.status(200).json({ output: finalCompletion.choices[0].message });
  } catch (error) {
    console.log(error);
  }
}