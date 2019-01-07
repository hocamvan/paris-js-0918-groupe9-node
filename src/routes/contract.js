const express = require('express');
const connection = require('../helper/conf.js')
const Router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'tmp/' });
const fs = require('fs');

Router.get('/', (req, res) => {
    connection.query('SELECT * from contract', (err, results) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération des données');
        } else {
            res.json(results);
        }
    });
})
Router.get('/:id', (req, res) => {
    connection.query('SELECT * from contract where id=?', req.params.id, (err, results) => {
        if (err) {
            res.status(500).send("Erreur lors de la récupération des données");
        } else {
            res.json(results);
        }
    });
})
Router.post('/', (req, res) => {
    connection.query('INSERT into contract SET ?', req.body, (err, results) => {
        console.log(results);
        if (err) {
            console.log(err);
            res.status(500).send(`Erreur lors de l'insertion des données`);
        }
        else {
            res.sendStatus(200);
            }
        })
});
Router.post('/ajouteclub', (req, res) => {
        let insertSqlQuery = 'INSERT INTO contract (project_id,club_id,name,url_contract) VALUES(?,?,?,?)';
        let valuesToInsert = [req.body.project_id, req.body.club_id, req.body.name, req.body.url_contract];
        connection.query(insertSqlQuery, valuesToInsert, (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send(`Erreur lors de l'insertion des données`);  
            }
            else {
                res.sendStatus(200);
            }
        })
    });
Router.put('/:id', (req, res) => {
    const idcontract = req.params.id;
    const formData = req.body;
    formData.updated_at = new Date();
    connection.query('UPDATE contract SET ? WHERE id = ?', [formData, idcontract], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send("Erreur lors de la modification des données");
        } else {
            res.sendStatus(200);
        }

    })
})
Router.delete('/:id', (req, res) => {
    connection.query('DELETE FROM contract WHERE id =?', req.params.id, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send("Erreur lors de la suppression");
        } else {
            res.sendStatus(200);
        }

    })
})

Router.get('/project/:idproject', (req, res) => {
    connection.query('select a.*,b.name as clubName, c.name as projectName from contract a \
    inner join club b on a.club_id = b.id \
    inner join project c on a.project_id = c.id \
    where a.project_id = ?',req.params.idproject, (err, results) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération des employés');
        } else {
            res.json(results);
        }
    });
})

Router.get('/order/:idcontract', (req, res) => {
    connection.query('select * from order inner join contract on order.contract_id = contract.id where contract.id = ?',req.params.idcontract, (err, results) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération des employés');
        } else {
            res.json(results);
        }
    });
})

Router.get('/suvey/:idcontract', (req, res) => {
    connection.query('select contract.name, contract.url_contract, contract.url_signed_contract from contract inner join club on contract.club_id = club.id where club.id = ?',req.params.idclub, (err, results) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération des employés');
        } else {
            res.json(results);
        }
    });
})
Router.post('/uploaddufichier', upload.single('file'), function (req, res, next) {

    fs.rename(req.file.path, 'public/files/' + req.file.originalname, function (err) {
        if (err) {
            res.send('problème durant le déplacement')
        } else {
            res.send(`http://localhost:3030/files/${req.file.originalname}`); 
        }
    });
})
module.exports = Router;