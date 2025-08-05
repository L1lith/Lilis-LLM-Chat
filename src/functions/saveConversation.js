import getDataDirectory from "./getDataDirectory";

export default async function saveConversation(conversation) {
  const { join } = require("path");
  const conversationsDir = join(await getDataDirectory(), "chats");
  const destination = join(conversationsDir, conversation.id + ".json");
  const { writeFile } = require("fs/promises");
  await writeFile(destination, JSON.stringify(conversation));
}
