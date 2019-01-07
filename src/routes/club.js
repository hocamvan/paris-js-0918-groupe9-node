const express = require("express");
const connection = require("../helper/conf.js");
const Router = express.Router();

const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require("nodemailer");

Router.get('/', (req, res) => {
  connection.query('SELECT * from club', (err, results) => {
      if (err) {
          res.status(500).send('Erreur lors de la récupération des employés');
      } else {
          res.json(results);
      }
  });
})

Router.get("/table", (req, res) => {
  connection.query(
    "SELECT club.id,club.name as clubName, club.url_logo, contract.name as contractName, `order`.status, survey.status as surveyStatus, `action`.name as actionName\
    FROM club\
    LEFT OUTER JOIN contract ON club.id = contract.club_id\
    LEFT OUTER JOIN `order` ON contract.id = `order`.contract_id \
    LEFT OUTER JOIN survey ON contract.id = survey.contract_id\
    LEFT OUTER JOIN `action`ON contract.id = `action`.contract_id",
    (err, results) => {
      if (err) {
        res.status(500).send("Erreur lors de la récupération des employés");
      } else {
        res.json(results);
      }
    }
  );
});
Router.get("/filtername", (req, res) => {
  connection.query(
    "SELECT club.name as clubName, club.url_logo, contract.name as contractName, `order`.status, survey.status as surveyStatus, `action`.name as actionName\
    FROM club\
    LEFT OUTER JOIN contract ON club.id = contract.club_id\
    LEFT OUTER JOIN `order` ON contract.id = `order`.contract_id \
    LEFT OUTER JOIN survey ON contract.id = survey.contract_id\
    LEFT OUTER JOIN `action` ON contract.id = `action`.contract_id\
    ORDER BY clubName ASC",
    (err, results) => {
      if (err) {
        res.status(500).send("Erreur lors de la récupération des employés");
      } else {
        res.json(results);
      }
    }
  );
});
Router.get("/filterdate", (req, res) => {
    connection.query(
      "SELECT club.name as clubName, club.url_logo, contract.name as contractName, `order`.status, survey.status as surveyStatus, `action`.name as actionName\
      FROM club\
      LEFT OUTER JOIN contract ON club.id = contract.club_id\
      LEFT OUTER JOIN `order` ON contract.id = `order`.contract_id \
      LEFT OUTER JOIN survey ON contract.id = survey.contract_id\
      LEFT OUTER JOIN `action` ON contract.id = `action`.contract_id\
      ORDER BY club.updated_at DESC",
      (err, results) => {
        if (err) {
          res.status(500).send("Erreur lors de la récupération des employés");
        } else {
          res.json(results);
        }
      }
    );
  });
Router.get("/:id", (req, res) => {
  connection.query(
    "SELECT * from club where id=?",
    req.params.id,
    (err, results) => {
      if (err) {
        res.status(500).send("Erreur lors de la récupération des données");
      } else {
        res.json(results);
      }
    }
  );
});
Router.post("/", (req, res) => {
  connection.query("INSERT into club SET ?", req.body, (err, results) => {
    console.log(results);
    if (err) {
      console.log(err);
      res.status(500).send(`Erreur lors de l'insertion des données`);
    } else {
      res.sendStatus(200);
    }
  });
});

Router.put("/:id", (req, res) => {
  const idcontract = req.params.id;
  const formData = req.body;
  formData.updated_at = new Date();
  connection.query(
    "UPDATE club SET ? WHERE id = ?",
    [formData, idcontract],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Erreur lors de la modification des données");
      } else {
        res.sendStatus(200);
      }
    }
  );
});
Router.delete("/:id", (req, res) => {
  connection.query(
    "DELETE FROM club WHERE id =?",
    req.params.id,
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Erreur lors de la suppression");
      } else {
        res.sendStatus(200);
      }
    }
  );
});

Router.get("/contract/:idclub", (req, res) => {
  connection.query(
    "select contract.name, contract.url_contract, contract.url_signed_contract, `order`.id as order_id, `order`.reference as order_reference, survey.id as survey_id\
    from contract \
    inner join club on contract.club_id = club.id \
    left join `order` on contract.id = `order`.contract_id\
    left join survey on contract.id = survey.contract_id\
    where club.id = ?", req.params.idclub, (err, results) => {
            if (err) {
                res.status(500).send('Erreur lors de la récupération des employés');
            } else {
                res.json(results);
            }
        });
})
Router.post('/create', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        let insertSqlQuery = 'INSERT INTO club (email, password, name, address) VALUES(?,?,?,?)';
        let valuesToInsert = [req.body.email, hash, req.body.name, req.body.address];
        connection.query(insertSqlQuery, valuesToInsert, (err, results) => {
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
    var smtpTransport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        secure: false, // true for 465, false for other ports
        auth: {
            user: `${process.env.MAIL_USER}`, // generated user
            pass: `${process.env.MAIL_PASSWORD}`// generated pass
        }

    });
    smtpTransport.sendMail({
        from: "e55a69bcaa-0fb124@inbox.mailtrap.io", // Expediteur
        to: req.body.email, // Destinataires
        subject: "Bienvenue au Allsponsored!", // Sujet
        text: `Bonjour, Voici votre indetifiant ${req.body.email} et mot de passe ${req.body.password} pour votre espace club `,
        html: `Bonjour, Voici votre indetifiant ${req.body.email} et mot de passe ${req.body.password} pour votre espace club `
    }, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.response);
        }
    });
    
});
module.exports = Router;
