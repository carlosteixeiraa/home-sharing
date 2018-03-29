var express = require('express');
var bodyParser = require('body-parser');    
var fileUpload = require('express-fileupload');
var bcrypt = require('bcrypt');
var session = require('express-session');
var mongoose = require("mongoose");
var app = express();
var porta = 3000;

app.set('view engine', 'pug');

app.use(express.static('public'));

app.use(fileUpload());

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(session({
    secret: '14tmn54t2ejk2',
    resave: false,
    saveUninitialized: true
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
    if(req.session.user) {
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
    } else {
        res.redirect('/login')
    }
});

app.get('/sair', (req, res) => {
    req.session.user = null;
    res.redirect('/')
})

app.get('/testes', (req, res) => {
    res.render ('testes');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/download', (req, res) => {
    if(req.session.user) {
        var s = req.query.s;
        var caminho = __dirname + '/uploads/';
        var download = caminho + s;
        
        res.download(download);
    } else {
        res.redirect('/login')
    }
})

app.post('/api/upload', (req, res) => {
    if(req.session.user) {
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
    } else {
        res.redirect('/login')
    }
});

var saltRounds = 10;
app.post('/api/registar', (req, res) => {

    var codigo = req.body.codigo;

    if(codigo == "pru10pru") {
        var salvarConta = new Conta();

        var ut = req.body.utilizador;
        var pw = req.body.password;
    
        bcrypt.hash(pw, saltRounds, (err, hash) => {
            salvarConta.utilizador = ut;
            salvarConta.password = hash;
            
            salvarConta.save((err, contaSalva) => {
                if(err) {
                    res.send(err);
                } else {
                    res.redirect('/');
                }
            });
        });
    } else {
        res.redirect('/');
    }
});

app.post('/api/login', (req, res) => {
    var utilizador = req.body.utilizador;
    var password = req.body.password;

    Conta.findOne({
        utilizador: utilizador
    }, (err, user) => {
        if (!user) {
            res.redirect('/')
        } else {
            bcrypt.compare(password, user.password, (err, resp) => {
                if(err) {
                    res.send(err);
                } else if(resp == true) {
                    req.session.user = user;
                    res.redirect('/')
                } else {
                    res.redirect('/')
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
});

var contaSchema = new mongoose.Schema({
    utilizador: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

var Conta = mongoose.model('contas', contaSchema)
var Ficheiro = mongoose.model('ficheiros', ficheiroSchema);


app.listen(porta, () => {
    console.log('Home Sharing a funcionar na porta ' + porta)
});