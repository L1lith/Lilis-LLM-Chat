import { join, writeFile } from "./fs";

export default async function saveConversation(conversation) {
  const destination = join("chats", conversation.id + ".json");
  await writeFile(destination, JSON.stringify(conversation));
}
