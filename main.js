var express = require('express');
var bodyParser = require('body-parser');    
var fileUpload = require('express-fileupload');
var mongoose = require("mongoose");
var app = express();
var porta = 3000;

app.set('view engine', 'pug');

app.use(express.static('public'));

app.use(fileUpload());

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/home-sharing', (err) => {
    if(err) {
        console.log('Home Sharing não conseguio ligar a base de dados!');
    } else {
        console.log('Home Sharing ligado a base de dados com sucesso!');
    }
});

app.get('/', (req, res) => {
    Ficheiro.find((err, Ficheiros) => {
        if (err) {
            console.error(err);
        } else {
            var passar = Ficheiros;
            res.render('index', {
                ficheiros: passar
            });
        }
    });    
});

app.get('/testes', (req, res) => {
    res.render ('testes');
});

app.get('/download', (req, res) => {
    var s = req.query.s;
    var caminho = __dirname + '/uploads/';
    var download = caminho + s;
    
    res.download(download);
})

app.post('/api/upload', (req, res) => {
    var ficheiro = req.files.ficheiro;
    console.log(req.files.ficheiro)
    var caminho = __dirname + '/uploads/' + ficheiro.name;

    ficheiro.mv(caminho, (err) => {
        if(err) {
            res.status(500).send(err);
        } else {

            var nomeFicheiro = ficheiro.name;
            var exts = nomeFicheiro.split('.');
            var ext = exts[1];

            var salvarFicheiro = new Ficheiro();

            salvarFicheiro.nome = nomeFicheiro;
            salvarFicheiro.ext = ext;

            salvarFicheiro.save((err, ficheiroSalvo) => {
                if(err) {
                    res.send(err);
                } else {
                    res.redirect('/');
                }
            })
        }
    })
});

var ficheiroSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    ext: {
        type: String,
        required: true
    },
    data_up: {
        type: Date,
        default: Date.now
    }
})

var Ficheiro = mongoose.model('ficheiros', ficheiroSchema);


app.listen(porta, () => {
    console.log('Home Sharing a funcionar na porta ' + porta)
});