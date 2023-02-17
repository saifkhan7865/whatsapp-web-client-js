const { MongoStore } = require("wwebjs-mongo");
const { Client, RemoteAuth } = require("whatsapp-web.js");

let allSessions = {};
const getClient = (uniqueWebBrowserSession, mongoose) => {
  try {
    const store = new MongoStore({ mongoose: mongoose });
    try {
      const client = new Client({
        authStrategy: new RemoteAuth({
          store: store,
          backupSyncIntervalMs: 60000,
          clientId: uniqueWebBrowserSession,
        }),
      });
      client.initialize();
      return client;
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};

const listenToObjects = (mongoose, sessions) => {
  sessions.forEach((session) => {
    try {
      const client = getClient(session, mongoose);
      client.on("authenticated", (session) => {
        console.log("AUTHENTICATED", session);
      });
      client.on("ready", (msg) => {
        console.log("Client is ready!");
      });
      client.on("message", (message) => {
        console.log(message);
      });
      client.on("message_ack", (message_ack) => {
        console.log(message_ack);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = {
  listenToObjects,
};
