const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.static("public"));

app.use("/photos", express.static(path.join(__dirname, "photos")));

app.get("/calendar", async (req, res) => {

  const response = await fetch(
    "https://calendar.google.com/calendar/ical/d26e3a7db544e58cffd349ce913366f0b725cbb62569943bb631cd21621de50f%40group.calendar.google.com/public/basic.ics"
  );

  const text = await response.text();

  res.send(text);
});

app.get("/photos", (req, res) => {

    const photosDir = path.join(__dirname, "photos");

    const photos = fs.readdirSync(photosDir)
        .filter(file =>
            file.endsWith(".jpg") ||
            file.endsWith(".jpeg") ||
            file.endsWith(".png")
        );

    res.json(photos);
});

app.listen(3000, () => {
  console.log("Serveur lancé !");
});