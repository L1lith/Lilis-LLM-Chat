export default function convertMessagesToOpenAIFormat(messages) {
  return messages.map((message) => {
    const output = { content: message.content };
    if (message.from === "AI") {
      output.role = "assistant";
    } else if (message.from === "User") {
      output.role = "user";
    } else {
      throw new Error("Unrecognized Message Author");
    }
    return output;
  });
}
