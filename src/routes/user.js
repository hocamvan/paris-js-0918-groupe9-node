const express = require("express");
const connection = require("../helper/conf.js");
const Router = express.Router();
const bcrypt = require("bcrypt");

Router.get("/", (req, res) => {
  connection.query("SELECT * from user", (err, results) => {
    if (err) {
      res.status(500).send("Erreur lors de la récupération des données");
    } else {
      res.json(results);
    }
  });
});
Router.get("/:id", (req, res) => {
  connection.query(
    "SELECT * from user where id=?",
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
  connection.query("INSERT into user SET ?", req.body, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send(`Erreur lors de l'insertion des données`);
    } else {
      res.sendStatus(200);
    }
  });
});
Router.put("/:id",(req, res, next) => {
    req.body.updated_at = new Date();
    next();
  },
  (req, res) => {
    const idUser = req.params.id;
    const formData = req.body;
    console.log(formData);
    connection.query(
      "UPDATE user SET ? WHERE id = ?",
      [formData, idUser],
      (err, results) => {
        console.log(req.body);
        if (err) {
          console.log(err);
          res.status(500).send("Erreur lors de la modification des données");
        } else {
          res.sendStatus(200);
        }
      }
    );
  }
);

Router.put(
  "/password/:id",
  (req, res, next) => {
    connection.query(
      "SELECT password from user where id = ?",
      req.params.id,
      (err, result) => {
        if (err) throw err;
        bcrypt.compare(req.body.oldPassword, result[0].password, (err, result) => {
          if (result) {
            req.body.updated_at = new Date();
            next();
          }
        });
      }
    );
  },
  (req, res) => {
    const idUser = req.params.id;
    const password = req.body.password;
    const update = req.body.updated_at;

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      connection.query(
        "UPDATE user SET password = ?, updated_at = ? WHERE id = ?",
        [hash, update, idUser],
        (err, results) => {
          if (err) {
            res.status(500).send("Erreur lors de la modification des données");
          } else {
            res.sendStatus(200);
          }
        }
      );
    });
  }
);

Router.delete("/:id", (req, res) => {
  connection.query(
    "DELETE FROM user WHERE id =?",
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

module.exports = Router;
