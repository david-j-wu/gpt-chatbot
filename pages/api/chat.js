// Logic for the ChatGPT-powered `/api/chat` endpoint
export default async function handler(req, res) {
  try {
    // Thrown an error if the request does not have the POST method
    if (req.method !== "POST") {
      let error = new Error("Request does not have the POST method.");
      error.statusCode = 405;
      error.body = { error: { reason: "Method not allowed" } };
      throw error;
    }

    // Processing the request body
    const messages = req.body.messages;

    // Sending a request to the OpenAI create chat completion endpoint

    // Setting parameters for our request
    const createChatCompletionEndpointURL =
      "https://api.openai.com/v1/chat/completions";
    const createChatCompletionReqParams = {
      model: "gpt-3.5-turbo",
      messages,
    };

    // Sending our request using the Fetch API
    const createChatCompletionRes = await fetch(
      createChatCompletionEndpointURL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        },
        body: JSON.stringify(createChatCompletionReqParams),
      }
    );

    // Processing the response body
    const createChatCompletionResBody =
      await createChatCompletionRes.json();

    // Error handling for the OpenAI endpoint
    if (createChatCompletionRes.status !== 200) {
      let error = new Error(
        "Create chat completion request was unsuccessful."
      );
      error.statusCode = createChatCompletionRes.status;
      error.body = createChatCompletionResBody;
      throw error;
    }

    // Properties on the response body
    const reply = createChatCompletionResBody.choices[0].message;
    const usage = createChatCompletionResBody.usage;

    // Logging the results
    console.log(`Create chat completion request was successful. Results:
Replied message: 

${JSON.stringify(reply)}

Token usage:
Prompt: ${usage.prompt_tokens}
Completion: ${usage.completion_tokens}
Total: ${usage.total_tokens}
`);

    // Sending a successful response for our endpoint
    res.status(200).json({ reply });
  } catch (error) {
    // Error handling

    // Server-side error logging
    console.log(`Thrown error: ${error.message}
Status code: ${error.statusCode}
Error: ${JSON.stringify(error.body)}
`);

    // Sending an unsuccessful response for our endpoint
    res.status(error.statusCode || "500").json({
      error: {
        reply: {
          role: "assistant",
          content: "An error has occurred.",
        },
      },
    });
  }
}
