import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFileTree } from "./github-api.js";

const generationConfig = {
    maxOutputTokens: 2000,
    temperature: 0.1,
};

const modelName = "gemini-1.5-flash-002";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: generationConfig,
});

const chatWithAgent = async (token, prompt, history = []) => {
    const filetree = await getFileTree(token, prompt);
    const chat = model.startChat({
        history: history,
    });
    return chat.sendMessage(`
SYSTEM MESSAGE:
You are a cloud agent, which can host cloud applications for the user.
You need the following data to host the application:
- Github URL
- Framework Type or Dockerfile
  Choices (Any one, if multiple, choose other): 
  - Node
  - React
  - Express
  - Next
  - Flask
  - Django
  - Docker
  - Other
- Branch name (default main)
- Folder name (default .)
- Name of the application

Chat with the user, call the functions if required.
Respond in the following format: 
{
    "userReply": "YOUR REPLY",
    "systemInfo": {
        "name": ""
        "githubUrl": "" || null,
        "framework": "" || null,
        "baseDirectory": "" || null,
        "branchName": "" || null
    } || null
}
DO NOT RESPOND IN ANY OTHER FORMAT
DO NOT USE MARKDOWN
If you do not have data for any of the fields in the systemInfo field, return systemInfo as null
systemInfo should be null when asking any follow up questions
DO NOT ASK FOR CONFIRMATION
ASSUME THE FRAMEWORK BASED ON THE FILES, SET IT TO OTHER IF YOU DONT KNOW
ASSUME branch AS main UNLESS SPECIFIED BY THE USER
ASSUME baseDirectory AS . UNLESS ASSUMED BY THE USER

-------

USER PROMPT:
${prompt}

-------

This is the file tree of the repository
${filetree}
`);
};

export { chatWithAgent };
