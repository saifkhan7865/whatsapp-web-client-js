// @ts-check
const express = require("express");
const fs = require("fs");
const { Client, MessageMedia, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
const MONGODB_URI =
  "mongodb+srv://Saif:Arhaan123@cluster0.mj6hd.mongodb.net/test";
const app = express();
const PORT = 2000;
app.use(express.json({ limit: "16mb" }));
app.listen(PORT, () => console.log("Listening on port " + PORT));

// mongoose.connect(MONGODB_URI);
mongoose.connect(MONGODB_URI).then(() => {
  const store = new MongoStore({ mongoose: mongoose });
  const client = new Client({
    authStrategy: new RemoteAuth({
      store: store,
      backupSyncIntervalMs: 300000,
    }),
  });

  client.initialize();

  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    app.get("/qr", (req, res) => {
      res.send(qr);
    });
  });

  client.on("auth_failure", (msg) => {
    console.error("AUTHENTICATION FAILURE", msg);
  });

  client.on("ready", (msg) => {
    console.log("Client is ready!");
  });

  client.on("authenticated", (session) => {
    console.log("AUTHENTICATED", session);
  });
});

const allClients = {};
const getClient = (sessionID) => {
  if (!allClients[sessionID]) {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000,
      }),
    });
    client.initialize();
    allClients[sessionID] = client;
  }
  return allClients[sessionID];
};
app.get("/sessionStart/:sessionid", (req, res) => {
  const sessionid = req.params.sessionid;
  const client = getClient(sessionid);
  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    res.send(qr);
  });
});
