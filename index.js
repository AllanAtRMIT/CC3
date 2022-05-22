const path = require('path');
const fs = require('fs');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');
const superagent = require('superagent')

const { env } = require('process');
const req = require('express/lib/request');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto')


const API_URL = 'https://w5fqdgkvfb.execute-api.ap-southeast-2.amazonaws.com/test'

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

app.post('/login', (req, res) => {
    superagent
        .post(`${API_URL}/user`)
        .send({...req.body, method: 'GET'})
        .end((err, result) => {
            if (!result.body['error']) { req.session.user = req.body.username }
            res.send(result.body)
        })
})

app.get('/register', (req, res) => {
    let template = Handlebars.compile(fs.readFileSync('./templates/view_register.html', {encoding: 'utf-8'}))
    res.send(template())
})

app.post('/register', async (req, res) => {
    superagent
        .post(`${API_URL}/user`)
        .send(req.body)
        .end((err, result) => {
            // if (!result.body['error']) { req.session.user = req.body.username }
            res.send(result.body)
        })
})

app.get('/', (req, res) => {
    if (!req.session['user']) { res.redirect('/login'); return }
    let template = Handlebars.compile(fs.readFileSync('./templates/view_feed.html', {encoding: 'utf-8'}))
    res.send(template({ username: req.session.user }))
})

app.get('/user/:userid', (req, res) => {
    let template = Handlebars.compile(fs.readFileSync('./templates/view_user.html', {encoding: 'utf-8'}))
    res.send(template())
})

app.get('/user/', (req, res) => {
    
})

// Create Post
app.post('/post', (req, res) => {
    superagent
        .post(`${API_URL}/post`)
        .send({
            owner: req.body.owner,
            text: req.body.text,
        })
        .end((err, result) => {
            res.send(result.body)
        })
})

// Get Posts
app.get('/post', (req, res) => {
    superagent
        .get(`${API_URL}/post`)
        .send({...req.body, method: 'GET'})
        .end((err, result) => {
            res.send(result.body)
        })
})

const PORT = 3000
app.listen(PORT, () => { console.log(`Listening on port ${PORT}.`); })