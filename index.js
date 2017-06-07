const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const token = "EAAR75SJVOc0BAImd5GhdETN37HnJjrPbAhaUlPFgqcWbhJcqY5tfe4xOAeEsB5xnSCegOprpKElN99FM03rVpR395vTsbTpGAKHt4cHIHy2E1Ow2ZCdU0EDHZCQoL60gXRucLHcF3BZBZCEZArCWrbIYEhLWCiLly8ur5Omciaeqma6TCXO37"

app.set('port', 1337)

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('Hello, how are you? [stub]')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'never_gonna_give_you_up_never_gonna_let_you_down') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token :c')
	}
})

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			if (text === '/generic'){ 
				sendGenericMessage(sender)
				continue
			}
			if (text === 'ping') {
				sendTextMessage(sender, "pong")
				continue
			}
			if (text.indexOf("/pytest") != -1) {
				brainExecutor(sender, text)
				continue
			}
			sendTextMessage(sender, "echo: " + text.substring(0, 200))
		}
	}
	res.sendStatus(200)
})

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "МИРЭА <3",
					"subtitle": "Крутой линк на сайт",
					"image_url": "https://avatanplus.com/files/resources/mid/573c5e7242577154c3d0ee60.png",
					"buttons": [{
						"type": "web_url",
						"url": "http://mirea.ru",
						"title": "MTU"
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function brainExecutor(sender, input) {
	var python = require('child_process').spawn('python', ["../../brain/general.py", input]);
    var output = "";
    python.stdout.on('data', function(data){ output += data });
    python.on('close', function(code){ 
       if (code !== 0) {  
           console.log('Python side error :(')
           return;
       }
       sendTextMessage(sender, output);
    });
}

app.listen(app.get('port'), function() {
	console.log("it's alive!1, port NO.", app.get('port'))
})
