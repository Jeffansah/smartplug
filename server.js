const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();
const port = 3001;

// Initialize Firebase Admin SDK
const serviceAccount = require("./gsk-smartplug-firebase-adminsdk-96fyi-cd6ccffd66.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gsk-smartplug-default-rtdb.firebaseio.com",
});

// Parsing incoming JSON data
app.use(bodyParser.json());

// API endpoint to receive smart plug data and push to Firebase
app.post("/api/receive-data", (req, res) => {
  const { voltage, current, temperature, humidity } = req.body;

  // Push the data to Firebase Database
  const db = admin.database();
  const readingsRef = db.ref("readings");

  readingsRef
    .push({
      voltage,
      current,
      temperature,
      humidity,
      timestamp: new Date().toLocaleString(),
    })
    .then(() => {
      console.log("Data successfully pushed to Firebase.");
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error("Error pushing data to Firebase:", error);
      res.sendStatus(500);
    });
});

// Endpoint to retrieve data from Firebase
app.get("/api/retrieve-data", (req, res) => {
  const db = admin.database();
  const readingsRef = db.ref("readings");

  readingsRef.once(
    "value",
    (snapshot) => {
      const data = snapshot.val();
      res.status(200).send(data);
    },
    (error) => {
      console.error("Error retrieving data from Firebase:", error);
      res.sendStatus(500);
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
