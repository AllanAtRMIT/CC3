const { DynamoDBClient, CreateTableCommand, ScanCommand } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const crypto = require('crypto')

exports.handler = async (event, context, callback) => {
    let dub = new DynamoDBClient({region: 'ap-southeast-2'})
    let doc = DynamoDBDocumentClient.from(dub)
    let body = JSON.parse(event.body)
    let method = event.httpMethod
    if (method == 'GET') {
        let data = await doc.send(new ScanCommand({
            TableName: 'USERS',
            FilterExpression: 'username = :u AND password = :p',
            ExpressionAttributeValues: {
                ":u": { S: body.username },
                ":p": { S: body.password }
            },
            ProjectionExpression: 'id',
        }))

        if (data) {
            return { statusCode: 200, body: JSON.stringify({ redirect: '/' }) }
        } else {
            return { statusCode: 200, body: JSON.stringify({ error: 'Username/ Password Incorrect' }) }
        }
    }

    if (method == 'POST') {
        if (!body['password']) { return { statusCode: 400, body: JSON.stringify({ error: 'Must include a password' }) } }
        if (!body['username']) { return { statusCode: 400, body: JSON.stringify({ error: 'Must include a username' }) } }
        
        let data = await doc.send(new ScanCommand({
            TableName: 'USERS',
            FilterExpression: 'username = :u',
            ExpressionAttributeValues: {
                ":u": { S: body.username },
            },
            ProjectionExpression: 'id',
        }))
        if (data.Items.length > 0) { return { statusCode: 400, body: JSON.stringify({ error: 'Username already taken' }) } }
        
        doc.send(new PutCommand({
            TableName: 'USERS',
            Item: {
                username: body.username,
                id: crypto.randomBytes(64).toString('hex'),
                password: body.password
            }
        }))

        return { statusCode: 200, body: JSON.stringify({ redirect: '/' }) }
    }
}