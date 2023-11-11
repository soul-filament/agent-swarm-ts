import * as fs from 'fs'
import * as exec from 'child_process'
import { WithSpinner } from '../utils/colors'

export class Tool {

    public static load (name: string) {
        const def = fs.readFileSync(`_data/tools/${name}.json`)
        const raw = JSON.parse(def.toString())
        return {
            name: raw.name,
            description: raw.description,
            parameters: raw.parameters,
        }
    }

    @WithSpinner('Invoking local tool')
    public static invoke (name: string, params: any) {

        try  { params = JSON.parse(params) } catch (e) {}

        // read in its definition
        let raw = fs.readFileSync(`_data/tools/${name}.json`)
        let definition = JSON.parse(raw.toString())

        // Read in the handler function
        let handler = fs.readFileSync(`_data/tools/${name}.js`)

        // Clean up old env if needed
        exec.execSync(`rm -rf ../executionEnv/${name}`)
        exec.execSync(`mkdir ../executionEnv/${name}`)

        // Copy over the files
        exec.execSync(`cp -r _data/tools/${name}* ../executionEnv/${name}`)
        fs.writeFileSync(`../executionEnv/${name}/input.json`, JSON.stringify(params, null, 2))

        // rename the handler function
        exec.execSync(`mv ../executionEnv/${name}/${name}.js ../executionEnv/${name}/handler.js`)

        // Create the invoker file
        exec.execSync(`cp _data/tools/_invoker.js ../executionEnv/${name}/invoker.js`)

        // invoke it
        if (params.dependencies && params.dependencies.length > 0)
            exec.execSync(`cd ../executionEnv/${name} && npm i ${params.dependencies}`)
        exec.execSync(`cd ../executionEnv/${name} && bun invoker.js`)

        // read the result
        let result = fs.readFileSync(`../executionEnv/${name}/result.json`)
        result = JSON.parse(result.toString())
        
        return result
    }

}