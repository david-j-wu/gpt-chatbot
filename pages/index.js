import Head from "next/head";
import { useState, useEffect, useRef } from "react";

// Used to parse message contents as markdown
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  // State variables
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "You are a chatbot that is helpful and replies concisely",
    },
  ]); // An array of the messages that make up the chat
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(false);

  // `onChange` event handler to update `newMessageText` as the user types
  const onChange = (event) => {
    setNewMessageText(event.target.value);
  };

  // `onClick` event handler to create a new chat
  const onClick = () => {
    setMessages([
      {
        role: "system",
        content: "You are a chatbot that is helpful and replies concisely",
      },
    ]);
    setNewMessageText("");
  };

  // `onSubmit` event handler fired when the user submits a new message
  const onSubmit = async (event) => {
    event.preventDefault();
    setMessages([...messages, { role: "user", content: newMessageText }]);
    setLoadingStatus(true);
    setNewMessageText("");
  };

  // `onKeyDown` event handler to send a message when the return key is hit
  // The user can start a new line by pressing shift-enter
  const onKeyDown = (event) => {
    if (event.keyCode == 13 && event.shiftKey == false) {
      onSubmit(event);
    }
  };

  // Effect hook triggered when `loadingStatus` changes
  // Triggered on form submission
  useEffect(() => {
    // Function that calls the `/api/chat` endpoint and updates `messages`
    const fetchReply = async () => {
      try {
        // Try to fetch a `reply` from the endpoint and update `messages`
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages }),
        });

        const responseBody = await response.json();
        const reply =
          response.status === 200
            ? responseBody.reply
            : responseBody.error.reply;

        setMessages([...messages, reply]);
      } catch {
        // Catch and handle any unexpected errors
        const reply = {
          role: "assistant",
          content: "An error has occured.",
        };

        setMessages([...messages, reply]);
      }
      // Set `setLoadingStatus` to false
      setLoadingStatus(false);
    };

    // `fetchReply` executes only if a new message has been submitted
    // `setLoadingStatus(false)` triggers the hook again
    // No action occurs the second time because of the condition
    if (loadingStatus === true) {
      fetchReply();
    }
  }, [loadingStatus]);

  // Logic for auto-adjusting the textarea height as the user types
  // Ref variables
  const textareaRef = useRef(null);
  const backgroundRef = useRef(null);
  const whitespaceRef = useRef(null);

  // Effect hook triggered when `newMessageText` changes
  useEffect(() => {
    // Set the textarea height to 0 px for an instant
    // Triggers scroll height to be recalculated
    // Otherwise, the textarea won't shrink
    textareaRef.current.style.height = "0px";

    const MAX_HEIGHT = 320;
    const HEIGHT_BUFFER = 4;
    const VERTICAL_SPACING = 20;

    const textareaContentHeight =
      textareaRef.current.scrollHeight + HEIGHT_BUFFER;

    const textareaHeight = Math.min(textareaContentHeight, MAX_HEIGHT);

    textareaRef.current.style.height = textareaHeight + "px";
    backgroundRef.current.style.height =
      textareaHeight + 2 * VERTICAL_SPACING + "px";
    whitespaceRef.current.style.height =
      textareaHeight + 2 * VERTICAL_SPACING + "px";
  }, [newMessageText]);

  return (
    <>
      <Head>
        <title>GPT Chatbot</title>
        <meta
          name="description"
          content={
            "GPT Chatbot: A simple ChatGPT-powered chatbot" +
            " built with Next.js and Tailwind CSS"
          }
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto h-screen max-w-full sm:max-w-3xl">
        <div className="py-8">
          <h1 className="text-center text-6xl font-bold text-blue-500">
            GPT Chatbot
          </h1>
        </div>

        {messages.length === 1 && (
          <div className="mx-10 mt-20 flex justify-center">
            <div>
              <p className="mb-2 font-bold">
                GPT Chatbot is a basic chatbot built with the OpenAI API,
                Next.js and Tailwind CSS
              </p>
              <p className="mb-32">
                To start a conversation, type a message below and hit send
              </p>
              <p className="mb-2">
                Built by David Wu (
                <a
                  className="text-blue-500"
                  target="_blank"
                  href="https://twitter.com/david_j_wu"
                >
                  @david_j_wu
                </a>
                )
              </p>
              <p>
                Read the tutorial to build this chatbot{" "}
                <a
                  className="text-blue-500"
                  target="_blank"
                  href="https://davidwu.io/posts/building-a-chatbot-with-openais-chatgpt-api-nextjs-and-tailwind-css/"
                >
                  here
                </a>{" "}
                on{" "}
                <a
                  className="text-blue-500"
                  target="_blank"
                  href="https://davidwu.io/"
                >
                  davidwu.io
                </a>
              </p>
            </div>
          </div>
        )}

        <div>
          {messages.slice(1).map((message, index) => (
            <div className="my-4 mx-2" key={index.toString()}>
              <p className="font-bold">
                {message.role === "assistant" ? "GPT Chatbot" : "You"}
              </p>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ))}
        </div>

        {loadingStatus && (
          <div className="mx-2 mt-4">
            <p className="font-bold">GPT Chatbot is replying...</p>
          </div>
        )}

        {!loadingStatus && messages.length > 1 && (
          <div className="mt-4 flex justify-center">
            <button
              className="h-11 rounded-md border-2 border-gray-500
                         bg-gray-500 px-1 py-1 hover:border-gray-600 
                         hover:bg-gray-600"
              onClick={onClick}
            >
              <p className="font-bold text-white">New chat</p>
            </button>
          </div>
        )}

        <div ref={whitespaceRef} className="z-0"></div>
        <div
          ref={backgroundRef}
          className="fixed bottom-0 z-10 w-full max-w-full bg-white/75
                     sm:max-w-3xl"
        ></div>

        <div
          className="fixed bottom-5 z-20 w-full max-w-full 
                     sm:max-w-3xl"
        >
          <form className="mx-2 flex items-end" onSubmit={onSubmit}>
            <textarea
              ref={textareaRef}
              className="mr-2 grow resize-none rounded-md border-2 
                       border-gray-400 p-2 focus:border-blue-600 
                         focus:outline-none"
              value={newMessageText}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder="Why is the sky blue?"
            />

            {loadingStatus ? (
              <button
                className="h-11 rounded-md border-2 border-blue-400
                         bg-blue-400 px-1 py-1"
                disabled
              >
                <p className="font-bold text-white">Send</p>
              </button>
            ) : (
              <button
                className="h-11 rounded-md border-2 border-blue-600
                         bg-blue-600 px-1 py-1 hover:border-blue-700 
                         hover:bg-blue-700"
                type="submit"
              >
                <p className="font-bold text-white">Send</p>
              </button>
            )}
          </form>
        </div>
      </main>
    </>
  );
}
