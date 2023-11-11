import OpenAI from "openai";
import { OpenAIAssistant } from "../openai/assistant";
import {createInterface} from 'readline';

export async function haveChat (agent: OpenAIAssistant) {

    const userMessage = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    while (true) {
        const userInput = await new Promise<string>(resolve => userMessage.question('You: ', resolve))
        const agentResponse = await agent.respondToUserMessage(userInput)
        //@ts-ignore
        console.log(`Agent: ${agentResponse.content[0].text.value}`)
    }


}