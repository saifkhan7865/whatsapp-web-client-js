// @ts-check
const express = require("express");
const fs = require("fs");
const { Client, MessageMedia, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const { listenToObjects } = require("./listeners");
const Session = require("./sessionsModel");

mongoose.set("strictQuery", true);
const MONGODB_URI =
  "mongodb+srv://Saif:Arhaan123@cluster0.mj6hd.mongodb.net/test";
const app = express();
const PORT = 2000;
app.use(express.json({ limit: "16mb" }));
app.listen(PORT, () => console.log("Listening on port " + PORT));

mongoose.connect(MONGODB_URI);

const allClients = {};
const getClient = (sessionID) => {
  try {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 60000,
        clientId: sessionID,
      }),
    });
    client.initialize();
    return client;
  } catch (error) {
    console.log(error);
    return error;
  }
};
app.get("/sessionStart/:sessionid", async (req, res) => {
  const sessionid = req.params.sessionid;
  const session = await Session.create({
    session: sessionid,
    status: false,
  });
  const client = getClient(sessionid);

  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    res.send(qr);
  });

  client.on("authenticated", async (session) => {
    console.log("AUTHENTICATED", session);
    await Session.updateOne(
      {
        session: sessionid,
      },
      {
        status: true,
      }
    );
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    // res.json("Client is ready!");
    // kill client
    client.destroy();
  });

  client.on("auth_failure", async () => {
    console.log("Auth failure");
    const removeSession = await Session.deleteOne({ session: sessionid });
    // res.json("Auth failure");
  });
});

app.get("/checkSessionStatus/:sessionid", async (req, res) => {
  const sessionid = req.params.sessionid;
  const client = getClient(sessionid);
  client.on("authenticated", async (session) => {
    console.log("AUTHENTICATED", session);
    await Session.updateOne(
      {
        session: sessionid,
      },
      {
        status: true,
      }
    );
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    res.json("Client is ready!");
  });

  client.on("auth_failure", async () => {
    console.log("Auth failure");
    const removeSession = await Session.deleteOne({ session: sessionid });
    res.json("Auth failure");
  });
});

app.get("/getChats/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;
  const client = getClient(sessionId);
  await client.initialize();
  let chats = [];
  client.getChats().then((chat) => {
    console.log(chat);
    chats.push(chat);
    res.json(chats);
  });
});

mongoose.connection.on("connected", async () => {
  console.log("Mongoose is connected!!!!");
  const sessions = await Session.find().lean();
  const sessionArr = sessions.map((sessionObj) => sessionObj?.session);
  listenToObjects(mongoose, sessionArr);

  // listenToObjects(mongoose);
});

app.get("getChats/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  const client = getClient(sessionId);
});
