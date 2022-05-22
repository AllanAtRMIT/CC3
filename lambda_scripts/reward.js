const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const crypto = require('crypto')
let dub = new DynamoDBClient({region: 'ap-southeast-2'})
let doc = DynamoDBDocumentClient.from(dub)

exports.handler = (event, context, callback) => {
    let body = JSON.parse(event.body)

    let method = event.input.httpMethod

    if (method == 'GET') {
        let data = await doc.send(new ScanCommand({
            TableName: 'REWARD',
            FilterExpression: 'id = :i',
            ExpressionAttributeValues: {
                ":i": { S: body.id },
            },
            ProjectionExpression: 'email',
        }))
    }

    if (method == 'POST') {
        doc.send(new PutCommand({
            TableName: 'USER',
            Item: {
                username: body.username,
                id: crypto.randomBytes(64).toString('hex'),
                password: body.password
            }
        }))
    }
}