const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')


exports.handler = async (event) => {
    let dub = new DynamoDBClient({region: 'ap-southeast-2'})
    let doc = DynamoDBDocumentClient.from(dub)

    let body = JSON.parse(event.body)
    let method = event.httpMethod

    if (method == 'GET') {
        if (!body['sources']) { return { statusCode: 400, body: JSON.stringify({ error: 'Must have list of sources' }) }}
        if (!body['after'] && !body['max']) { return { statusCode: 400, body: JSON.stringify({ error: 'Must have max entries or entries after' }) }}

        let posts = []
        let earliest = body['after'] || Date.now() - 604800000 // One Week
        let count = body['max'] || 20
        for (let i = 0; i < body.sources.length; i++) {
            let source = body.sources[i]
            let data = await doc.send(new QueryCommand({
                TableName: 'POSTS',
                KeyConditionExpression: `#owner = :u and #time >= :t`,
                ExpressionAttributeValues: {
                    ":u": { S: source },
                    ':t': { N: ''+earliest }
                },
                ExpressionAttributeNames: {
                    '#owner': 'owner',
                    '#time': 'time',
                    '#text': 'text'
                },
                ProjectionExpression: '#text, #time, #owner',
            }))

            data.Items.forEach(item => {
                posts.push({username: item.owner.S, time: item.time.N, test: item.text.S })
            })

        }

        return { statusCode: 200, body: JSON.stringify({ posts: posts.slice(0, count)}) }
    }

    if (method == 'POST') {
        try{
            await doc.send(new PutCommand({
                TableName: 'POSTS',
                Item: {
                    owner: body.owner,
                    time: Date.now(),
                    text: body.text
                }
            }))
        } catch (e) {
            return { statusCode: 200, body: JSON.stringify({error: ''+e}) }
        }
        return { statusCode: 200, body: JSON.stringify(body) }
    }
}

async function test() {
    console.log(await exports.handler({
        httpMethod: 'GET',
        body: JSON.stringify({ sources: ['Test'], max: 1})
    }))
}