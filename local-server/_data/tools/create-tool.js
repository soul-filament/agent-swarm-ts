const fs = require('fs')

export function handler (params) {

    try {
        params.parameters = JSON.parse(params.parameters)
    } catch (e) {
        params.parameters = []
    }

    fs.writeFileSync(`../../local-server/_data/tools/${params.name}.json`, JSON.stringify(params, null, 2))

    fs.writeFileSync(`../../local-server/_data/tools/${params.name}.js`, params.handler)

    return {
        name: params.name,
        status: 'success'
    }
}