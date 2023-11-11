import * as dotenv from 'dotenv'; dotenv.config()
import { OpenAIAssistant } from "../src/openai/assistant";
import { Tool } from '../src/openai/tools';
import { haveChat } from '../src/utils/livechat';

export async function run () {

    const agent = await OpenAIAssistant.create({ name: 'Test Assistant', tools: ['create-tool', 'calculator_app_advanced'] })
    haveChat(agent)

}

run()