import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getWeather(city) {
  const geoRes = await fetch(`https://wttr.in/${city}?format=j1`);
  const geoData = await geoRes.json();
  return geoData.current_condition[0];
}

async function getTodos() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
  const data = await res.json();
  return data;
}

async function weatherAgent(query) {
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Decide whether the user query is about weather or todos and call the correct tool.",
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
      {
        type: "function",
        function: {
          name: "todos_intent",
          description: "Fetch a list of fake todos",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
    ],
  });

  const toolCall = resp.choices[0].message.tool_calls?.[0];

  if (!toolCall) {
    console.log("🤔 No tool call made by the model.");
    return;
  }

  const fnName = toolCall.function.name;
  const args = toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {};

  let result;

  if (fnName === "weather_intent") {
    const city = args.city;
    result = await getWeather(city);
    console.log(`Weather in ${city}:`, result);
  } else if (fnName === "todos_intent") {
    result = await getTodos();
    console.log("Fake Todos:", result);
  }
}

weatherAgent("what is the weather in Banglore");
weatherAgent("show me some todos");