const mongoose = require("mongoose");

// create a schema for sessions with a unique id and a session object
const sessionSchema = new mongoose.Schema({
  session: {
    type: Object,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// create a model for sessions
const Session = mongoose.model("Session", sessionSchema);

// export the model
module.exports = Session;
