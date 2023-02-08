const express = require("express");
const app = express();
const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");

const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  //   console.log("QR RECEIVED", qr);
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", (message) => {
  console.log(message);
});

client.on("message_ack", (message_ack) => {
  console.log(message_ack);
});

client.initialize();
