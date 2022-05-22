const path = require('path');
const fs = require('fs');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');

const { env } = require('process');
const req = require('express/lib/request');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto')


const API_URL = 'w5fqdgkvfb.execute-api.ap-southeast-2.amazonaws.com/user/'

// let dub = new DynamoDBClient({region: 'ap-southeast-2'})
// let doc = DynamoDBDocumentClient.from(dub)

const app = express();
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('static'))

app.get('/login', (req, res) => {
    let template = Handlebars.compile(fs.readFileSync('./templates/view_login.html', {encoding: 'utf-8'}))
    res.send(template())
})

app.get('/register', (req, res) => {
    let template = Handlebars.compile(fs.readFileSync('./templates/view_register.html', {encoding: 'utf-8'}))
    res.send(template())
})

app.post('/register', async (req, res) => {
    try {
        let dub = new DynamoDBClient({region: 'ap-southeast-2'})
        let doc = DynamoDBDocumentClient.from(dub)

        let body = req.body


        let data = await doc.send(new ScanCommand({
            TableName: 'USERS',
            FilterExpression: 'username = :u',
            ExpressionAttributeValues: {
                ":u": { S: body.username },
            },
            ProjectionExpression: 'username',
        }))
        if (data.Items.length > 0) { res.send({ error: 'Username has already been used' }); return }


        let result = await doc.send(new PutCommand({
            TableName: 'USERS',
            Item: {
                username: body.username,
                id: crypto.randomBytes(64).toString('hex'),
                password: body.password
            }
        }))

        console.log(result)

        if (result) { res.send( { 'redirect': '/' }) }
    } catch {
        res.send({ error: 'Failed to Register' })
    }
})

app.get('/', (req, res) => {
    let template = Handlebars.compile(fs.readFileSync('./templates/view_feed.html', {encoding: 'utf-8'}))
    res.send(template())
})

app.get('/user/:userid', (req, res) => {
    let template = Handlebars.compile(fs.readFileSync('./templates/view_user.html', {encoding: 'utf-8'}))
    res.send(template())
})

app.get('/user/', (req, res) => {
    
})

const PORT = 3000
app.listen(PORT, () => { console.log(`Listening on port ${PORT}.`); })