const path = require('path');
const fs = require('fs');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');
const superagent = require('superagent')

const { env } = require('process');
const req = require('express/lib/request');
const { DynamoDBClient, ScanCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto')


const API_URL = 'https://w5fqdgkvfb.execute-api.ap-southeast-2.amazonaws.com/test'

const app = express();
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('static'))

// Login View
app.get('/login', (req, res) => {
    let template = Handlebars.compile(fs.readFileSync('./templates/view_login.html', {encoding: 'utf-8'}))
    res.send(template())
})

// Login API
app.post('/login', (req, res) => {
    superagent
        .post(`${API_URL}/user`)
        .send({...req.body, method: 'GET'})
        .end((err, result) => {
            if (!result.body['error']) { req.session.user = req.body.username }
            res.send(result.body)
        })
})

// Register View
app.get('/register', (req, res) => {
    let template = Handlebars.compile(fs.readFileSync('./templates/view_register.html', {encoding: 'utf-8'}))
    res.send(template())
})

// Register API
app.post('/register', async (req, res) => {
    superagent
        .post(`${API_URL}/user`)
        .send(req.body)
        .end((err, result) => {
            // if (!result.body['error']) { req.session.user = req.body.username }
            res.send(result.body)
        })
})

// Feed View
app.get('/', (req, res) => {
    if (!req.session['user']) { res.redirect('/login'); return }
    let template = Handlebars.compile(fs.readFileSync('./templates/view_feed.html', {encoding: 'utf-8'}))
    res.send(template({ username: req.session.user }))
})

app.get('/user/:userid', async (req, res) => {
    let vis = 'hidden'
    if(req.session['user']) {
        let dub = new DynamoDBClient({region: 'ap-southeast-2'})
        let doc = DynamoDBDocumentClient.from(dub)
    
        let data = await doc.send(new ScanCommand({
            TableName: 'USERS',
            FilterExpression: 'username = :u',
            ExpressionAttributeValues: {
                ":u": { S: req.session.user },
            },
            ProjectionExpression: 'username, id, password, subscriptions',
        }))
        if (data.Items[0]['subscriptions']) {
            let subs = JSON.parse(data.Items[0]['subscriptions'].S)
            if (subs.indexOf(req.params.userid) == -1) { vis = 'visible' } 
        }
    }

    let template = Handlebars.compile(fs.readFileSync('./templates/view_user.html', {encoding: 'utf-8'}))
    res.send(template({ userview: req.params.userid, vis: vis }))
})

app.get('/user/', (req, res) => {
    
})

// Create Post
app.post('/post', (req, res) => {
    superagent
        .post(`${API_URL}/post`)
        .send({
            owner: req.session.user,
            text: req.body.text,
        })
        .end((err, result) => {
            res.send(result.body)
        })
})

// Get Posts
app.post('/feed', async (req, res) => {
    let dub = new DynamoDBClient({region: 'ap-southeast-2'})
    let doc = DynamoDBDocumentClient.from(dub)

    let data = await doc.send(new ScanCommand({
        TableName: 'USERS',
        FilterExpression: 'username = :u',
        ExpressionAttributeValues: {
            ":u": { S: req.session.user },
        },
        ProjectionExpression: 'username, id, password, subscriptions',
    }))
    if (!data.Items[0]['subscriptions']) { return }
    superagent
        .get(`${API_URL}/post`)
        .send({...req.body, method: 'GET', sources: data.Items[0].subscriptions.S})
        .end((err, result) => {
            res.send(result.body)
        })
})

app.post('/subscribe', async (req, res) => {
    if (!req.session['user']) { return }

    let dub = new DynamoDBClient({region: 'ap-southeast-2'})
    let doc = DynamoDBDocumentClient.from(dub)

    let data = await doc.send(new ScanCommand({
        TableName: 'USERS',
        FilterExpression: 'username = :u',
        ExpressionAttributeValues: {
            ":u": { S: req.session.user },
        },
        ProjectionExpression: 'username, id, password, subscriptions',
    }))

    if (data.Items.length == 1) {
        console.log(data.Items[0])
        let subs = JSON.stringify([req.session.user])
        if (data.Items[0]['subscriptions']) {
            if (JSON.parse(data.Items[0]['subscriptions']['S']).indexOf(req.body.username) == -1) {
                subs = JSON.parse(data.Items[0]['subscriptions']['S'])
                subs.push(req.body.username)
                subs = JSON.stringify(subs)
            } else {
                subs = data.Items[0]['subscriptions']['S']
            }
        }
        let data2 = await doc.send(new UpdateCommand({
            TableName: 'USERS',
            Key: {
                username: data.Items[0].username.S,
                id: data.Items[0].id.S
            },
            UpdateExpression: 'set subscriptions = :s',
            ExpressionAttributeValues: {
                ":s": subs
            },
        }))
    }
})

app.post('/unsubscribe', async (req, res) => {
    let dub = new DynamoDBClient({region: 'ap-southeast-2'})
    let doc = DynamoDBDocumentClient.from(dub)

    let data = await doc.send(new ScanCommand({
        TableName: 'USERS',
        FilterExpression: 'username = :u',
        ExpressionAttributeValues: {
            ":u": { S: req.session.user },
        },
        ProjectionExpression: 'username, id, password, subscriptions',
    }))

    if (data.Items.length == 1) {
        console.log(data.Items[0])
        let subs = JSON.stringify([req.session.user])
        if (data.Items[0]['subscriptions']) {
            if (JSON.parse(data.Items[0]['subscriptions']['S']).indexOf(body.username) != -1) {
                subs = JSON.parse(data.Items[0]['subscriptions']['S'])
                subs.splice(subs.indexOf(body.username), 1)
                subs = JSON.stringify(subs)
            } else {
                subs = data.Items[0]['subscriptions']['S']
            }
        }
        let data2 = await doc.send(new UpdateCommand({
            TableName: 'USERS',
            Key: {
                username: data.Items[0].username.S,
                id: data.Items[0].id.S
            },
            UpdateExpression: 'set subscriptions = :s',
            ExpressionAttributeValues: {
                ":s": subs
            },
        }))
    }
})

const PORT = 3000
app.listen(PORT, () => { console.log(`Listening on port ${PORT}.`); })