/**
 * Webhook chamado pelo Dialogflow
 * 
 * Parte integrante do sistema TelegramBot 
 * feito para o desafio Carrefour 
 * 
 * date: 20200802
 * author: Giselli Hara Macedo <gi@hara.ninja>
 */

const express = require('express');
const app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var admin = require("firebase-admin");

var serviceAccount = require("./configs/firebase-adminsdk.json");
const e = require('express');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://projeto-bot-carrefour-ykch.firebaseio.com"
});

function localizador_loja(request, response) {
  response.json({"fulfillmentText" :"(NAO IMPLEMNTADO - localizador de lojas)" });
}

const db = admin.firestore();

function buscador_ofertas(request, response) {
  var categoria_produto = request.body.queryResult.parameters.categoria_produto;
  console.log('buscador_ofertas: ' + categoria_produto);

  db.collection('promocoes')
    .where('categoria_produto', '==', categoria_produto)
    .limit(3)
    .get()
    .then((documents) => {
    console.log('documentos localizados: ' + documents.size);

    if (documents.size > 0) {
      var fulfillmentMessages = [];

      documents.docs.forEach((document) =>{
        console.log(document.data());
        const title = document.data().title;
        const imgUri = document.data().imageUrl;
        const btUri = document.data().buttonUrl;
        const subtitulo = document.data().subtitle;

        var card = {};
        card.title = title;
        card.subtitle = subtitulo;
        card.imageUri = imgUri;
        card.buttons = [];
        card.buttons.push({
          "text" : 'Visualizar',
          "postback" : btUri
        });

        fulfillmentMessages.push({"card": card});
        console.log("CARD "+ card);
      });
      
      response.json({"fulfillmentMessages" : fulfillmentMessages});
    }
    else {
      response.json({"fulfillmentText" : "Infelizmente não encontrei promoções para a categoria selecionada"});
    }
  })
  .catch((error) => {
    console.log(`Error getting documents: ${error}`);
  });
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/gisellicarrefourwebhook', function(request, response) {
  
  var intentName = request.body.queryResult.intent.displayName;

  // localizar.loja -> localizador_loja
  // mostrar.ofertas -> buscador_ofertas
  if ( intentName == "localizar.loja"  ) {
    localizador_loja(request, response);
  }
  else if ( intentName == "mostrar.ofertas") {
    buscador_ofertas(request, response);
  }
});

const PORT = process.env.PORT || 8080;
const listener = app.listen(PORT, function() {
  console.log('Webhook escutando na porta ' + listener.address().port);
});
