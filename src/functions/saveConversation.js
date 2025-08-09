import { join, writeFile } from "./fs";

export default async function saveConversation(conversation) {
  const destination = await join("chats", conversation.id + ".json");
  console.log("Stringed convo", JSON.stringify(conversation), destination);
  await writeFile(destination, JSON.stringify(conversation));
}
