import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getWeather(city) {
  const geoRes = await fetch("https://wttr.in/banglore?format=j1");
  const geoData = await geoRes.json();
  return geoData;
}

async function weatherAgent(query) {
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Extract the city name from the user weather query.",
      },
      { role: "user", content: query },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "weather_intent",
          description: "Weather request with city name",
          parameters: {
            type: "object",
            properties: {
              city: { type: "string" },
            },
            required: ["city"],
          },
        },
      },
    ],
    tool_choice: { type: "function", function_name: "weather_intent" },
  });

  const toolCall = resp.choices[0].message.tool_calls?.[0];
  const args = JSON.parse(toolCall.function.arguments);
  const city = args.city;

  const summary = await getWeather(city);
  console.log(`\nQuery: ${query}\n📍 City: ${city}\n${summary}\n`);
}

weatherAgent("what is weather in Banglore");
