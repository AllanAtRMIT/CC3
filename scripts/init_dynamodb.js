const { readFileSync } = require('fs')

const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')

let dub = new DynamoDBClient({ region: 'ap-southeast-2'})
let doc = DynamoDBDocumentClient.from(dub)

const USERS = {
    AttributeDefinitions: [ 
        { AttributeName: 'username', AttributeType: 'S' },
        { AttributeName: 'id', AttributeType: 'S' },
    ],
    KeySchema: [
        { AttributeName: 'username', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
    },
    TableName: 'USERS',
    StreamSpecification: {
        StreamEnabled: false,
    },
}

const POSTS = {
    AttributeDefinitions: [ 
        { AttributeName: 'owner', AttributeType: 'S' },
        { AttributeName: 'time', AttributeType: 'N' },
    ],
    KeySchema: [
        { AttributeName: 'owner', KeyType: 'HASH' },
        { AttributeName: 'time', KeyType: 'RANGE' },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
    },
    TableName: 'POSTS',
    StreamSpecification: {
        StreamEnabled: false,
    },
}

const REWARDS = {
    AttributeDefinitions: [ 
        { AttributeName: 'owner', AttributeType: 'S' },
        { AttributeName: 'time', AttributeType: 'N' },
    ],
    KeySchema: [
        { AttributeName: 'owner', KeyType: 'HASH' },
        { AttributeName: 'time', KeyType: 'RANGE' },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
    },
    TableName: 'REWARDS',
    StreamSpecification: {
        StreamEnabled: false,
    },
}

async function main() {
    await doc.send(new CreateTableCommand(USERS))
    await doc.send(new CreateTableCommand(POSTS))
    await doc.send(new CreateTableCommand(REWARDS))
    // const list = JSON.parse(readFileSync('a2.json'))
    // list['songs'].forEach(song => {
    //     doc.send(new PutCommand({
    //         TableName: 'SONGS',
    //         Item: {
    //             title: song['title'],
    //             artist: song['artist'],
    //             year: song['year'],
    //             web_url: song['web_url'],
    //             img_url: song['img_url']
    //         }
    //     }))
    // })

    // let num = new Array(10).fill(0).map((v, i) => i)
    // for (let i = 0; i < 10; i++) {
    //     doc.send(new PutCommand({
    //         TableName: 'LOGIN',
    //         Item: {
    //             email: `s3855474${i}@student.rmit.edu.au`,
    //             username: `AllanBassett${i}`,
    //             password: [...num.slice(i), ...num.slice(0,i)].slice(0,6).join('')
    //         }
    //     }))
    // }
} 
main()