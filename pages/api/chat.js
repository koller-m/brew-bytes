import OpenAI from "openai";

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
    });
    res.status(200).json({ output: completion.choices[0].message });
  } catch (error) {
    console.log(error);
  }
}