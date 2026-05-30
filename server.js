const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.use(express.static("public"));

app.get("/calendar", async (req, res) => {

  const response = await fetch(
    "https://calendar.google.com/calendar/ical/d26e3a7db544e58cffd349ce913366f0b725cbb62569943bb631cd21621de50f%40group.calendar.google.com/public/basic.ics"
  );

  const text = await response.text();

  console.log(text);

  res.send(text);
});

app.listen(3000, () => {
  console.log("Serveur lancé !");
});