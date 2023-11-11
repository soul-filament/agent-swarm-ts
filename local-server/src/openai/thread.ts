import { Thread, ThreadCreateParams } from "openai/resources/beta/threads/threads";
import openai from "./openai";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages";
import { WithSpinner, complete, note, spinner } from "../utils/colors";
import { Tool } from "./tools";

export class OpenAIChatThread {

    constructor (private thread: Thread) {}

    public get id () {
        return this.thread.id;
    }

    @WithSpinner('Creating chat thread')
    public static async create (options?: ThreadCreateParams): Promise<OpenAIChatThread> {
        const thread = await openai.beta.threads.create(options);
        return new OpenAIChatThread(thread);
    }

    public async readLatestMessage (): Promise<ThreadMessage> {
        const messages = await openai.beta.threads.messages.list(this.thread.id, {
            order: 'desc'
        });
        return messages.data[0]
    }

    @WithSpinner('Adding user message')
    public async addUserMessage (content: string): Promise<ThreadMessage> {
        const message = await openai.beta.threads.messages.create(this.thread.id, { content, role: 'user' })
        return message;
    }

    public async runAgainstAgent (agent: string, message: string): Promise<ThreadMessage> {
        note('Started running agent against thread')

        // Add message
        await this.addUserMessage(message);

        // Run against agent
        const threadRun = await openai.beta.threads.runs.create(this.thread.id, {
            assistant_id: agent,
        })

        // Wait for completion
        for (let i = 0; i < 60; i++) {
            spinner(`Waiting for agent to respond (${i}s)`)

            const run = await openai.beta.threads.runs.retrieve(this.thread.id, threadRun.id)
        
            if (run.status === 'requires_action') {

                note('Agent requires actions invoked')

                const calls = run.required_action.submit_tool_outputs.tool_calls
                const toolResults = []
                for (let call of calls){
                    const tool = call.function.name
                    const params = call.function.arguments
                    const result = await Tool.invoke(tool, params)
                    toolResults.push({
                        tool_call_id: call.id,
                        output: JSON.stringify(result)
                    })
                }
                await openai.beta.threads.runs.submitToolOutputs(this.thread.id, threadRun.id, {
                    tool_outputs: toolResults
                })
                note('Supplied tool outputs to agent')
            }

            if (run.status === 'completed') {
                break;
            }
        
            await new Promise(resolve => setTimeout(resolve, 1000));
        
        }

        complete('Agent responce received')

        // Read the result
        return await this.readLatestMessage();
    }

}