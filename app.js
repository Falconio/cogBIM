const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Temperature = require("./models/temperatures");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const config = require("./config/config");

if (
  config.credentials.client_id == null ||
  config.credentials.client_secret == null ||
  config.db.uri == null
) {
  console.error(
    "Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET or MONGO_URI env. variables."
  );
  return;
}

// Express REST API
let app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(path.join(__dirname, "public")));
// app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/forge/oauth", require("./routes/oauth"));
app.use("/api/forge/oss", require("./routes/oss"));
app.use("/api/forge/modelderivative", require("./routes/modelderivative"));
app.use("/api/v1/db", require("./routes/db"));

// Express Error Handlers
app.use((err, req, res, next) => {
  next();
  console.error(err);
  res.status(err.statusCode).json(err);
});

/*
Socket.io Setting
*/

io.on("connection", function () {
  console.log("A connection to Socket has been established.");
});


mongoose.connect(config.db.uri, { useNewUrlParser: true });
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error:"));

db.once("open", () => {
  http.listen(PORT, () => {
    console.log(`Node server running on port ${PORT}`);
  });

  const temperatureCollection = db.collection("temperatures");
  const changeStream = temperatureCollection.watch();

  changeStream.on("change", (change) => {
    // console.log(change);

    if (change.operationType === "insert") {
      const temperature = change.fullDocument;
      io.emit("SensorStream", {
        id: temperature._id,
        sensor_id: temperature.sensor_id,
        sensor_room: temperature.sensor_room,
        temperature: temperature.temperature,
      });

    } else if (change.operationType === "delete") {
      io.emit("sensorDataDeleted", change.documentKey._id);
    }
  });
});

function between(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function FakeData() {
  Temperature.estimatedDocumentCount(function (err, count) {
    if (err) {
      console.log(err);
    } else {
      // console.log("Estimated Count :", count);
      if (count >= 2000) {
        Temperature.deleteMany({})
          .then(function () {
            // console.log("Data deleted"); // Success
          })
          .catch(function (error) {
            console.log(error); // Failure
          });
      }
    }
  });
  db.collection("temperatures").insertOne({
    sensor_id: "TEMP01",
    sensor_room: "Room - A",
    temperature: between(6, 32),
  });
}

var insertFake = setInterval(FakeData, 2000);
