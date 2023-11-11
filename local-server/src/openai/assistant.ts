import openai from "./openai";
import { Assistant } from "openai/resources/beta/assistants/assistants";
import { OpenAIChatThread } from "./thread";
import { WithSpinner, note } from "../utils/colors";
import { Tool } from "./tools";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages";

interface CreateAssistantProps {
    description?: string;
    instructions?: string;
    name?: string;
    tools?: string[];
}

export class OpenAIAssistant {

    constructor (
        private assistant: Assistant,
        public thread: OpenAIChatThread
    ) {}

    public static async newThread (assistantId: string): Promise<OpenAIAssistant> {
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        const thread = await OpenAIChatThread.create();
        return new OpenAIAssistant(assistant, thread);
    }

    @WithSpinner('Creating assistant')
    public static async create (options: CreateAssistantProps): Promise<OpenAIAssistant> {
        const assistant = await openai.beta.assistants.create({
            model: 'gpt-4-1106-preview',
            description: options.description,
            instructions: options.instructions,
            name: options.name,
            tools: (options.tools || []).map(tool => {
                return {
                    function: Tool.load(tool),
                    type: 'function'
                }
            })
        });
        return await OpenAIAssistant.newThread(assistant.id);
    }
    
    public async respondToUserMessage (content: string): Promise<ThreadMessage> {
        return await this.thread.runAgainstAgent(this.assistant.id, content);
    }
    
}