const express = require("express");
const app = express();
const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");

const clients = {};

app.get("/qr/:userId", (req, res) => {
  const userId = req.params.userId;
  if (clients[userId]) {
    return res.send({ error: "Client already exists for user" });
  }
  const client = new Client();
  client.on("qr", (qr) => {
    res.send(qr);
  });
  client.on("authenticated", () => {
    clients[userId] = client;
  });

  client.initialize();
});

app.get("/client/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!clients[userId]) {
    return res.status(404).send({ error: "Client not found for user" });
  }

  res.send(clients[userId]);
});

app.get("/chats/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!clients[userId]) {
    return res.status(404).send({ error: "Client not found for user" });
  }

  const client = clients[userId];

  client.getChats().then((chats) => {
    res.send(chats);
  });
});

app.listen(3002, () => {
  console.log("Express app listening on port 3000");
});

// 1.authentication
// 2.store session
