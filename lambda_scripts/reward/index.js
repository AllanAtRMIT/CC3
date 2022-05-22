const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')
const crypto = require('crypto')


exports.handler = async (event) => {
    let dub = new DynamoDBClient({region: 'ap-southeast-2'})
    let doc = DynamoDBDocumentClient.from(dub)

    let body = JSON.parse(event.body)
    let method = event.httpMethod

    if (method == 'GET') {
        if (!body['after'] && !body['max']) { return { statusCode: 400, body: JSON.stringify({ error: 'Must have max entries or entries after' }) }}

        let posts = []
        let earliest = body['after'] || Date.now() - 604800000 // One Week
        let expired = body['expired'] || false
        let count = body['max'] || 20
        let data = await doc.send(new QueryCommand({
            TableName: 'REWARDS',
            KeyConditionExpression: `#owner = :u and #time >= :t`,
            ExpressionAttributeValues: {
                ":u": { S: body.owner },
                ':t': { N: ''+earliest }
            },
            ExpressionAttributeNames: {
                '#owner': 'owner',
                '#time': 'time',
                '#text': 'text'
            },
            ProjectionExpression: '#time, #owner',
        }))

        data.Items.forEach(item => {
            posts.push({username: item.owner.S, time: item.time.N })
        })


        return { statusCode: 200, body: JSON.stringify({ posts: posts.slice(0, count)}) }
    }

    if (method == 'REWARDS') {
        doc.send(new PutCommand({
            TableName: 'REWARDS',
            Item: {
                owner: body.owner,
                time: Date.now(),
                id: crypto.randomBytes(64).toString('hex'),
                sender: body.sender,
                expired: false
            }
        }))
        return { statusCode: 200 }
    }
}

async function test() {
    console.log(await exports.handler({
        httpMethod: 'GET',
        body: JSON.stringify({ sources: ['Test'], max: 1})
    }))
}