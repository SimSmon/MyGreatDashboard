const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const app = express();

app.use(express.static("public"));

app.use("/photos", express.static(path.join(__dirname, "photos")));

app.use("/cache", express.static(path.join(__dirname, "cache")));


app.get("/calendar", async (req, res) => {

  const response = await fetch(
    "https://calendar.google.com/calendar/ical/d26e3a7db544e58cffd349ce913366f0b725cbb62569943bb631cd21621de50f%40group.calendar.google.com/public/basic.ics"
  );

  const text = await response.text();

  res.send(text);
});

async function generateThumbnail(input, output) {

    if (fs.existsSync(output)) {
        return;
    }

    await sharp(input)
        .resize(1920, 1080, {
            fit: "inside",
            withoutEnlargement: true
        })
        .jpeg({
            quality: 85
        })
        .toFile(output);

    console.log("Miniature créée :", output);
}

app.get("/photos", async (req, res) => {

    const photosDir =
        "/mnt/photoDashBoard";

    const cacheDir =
        path.join(__dirname, "cache");

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
    }

    const photos = fs.readdirSync(photosDir)
        .filter(file =>
            /\.(jpg|jpeg|png)$/i.test(file)
        );

    for (const photo of photos) {

        const input =
            path.join(photosDir, photo);

        const output =
            path.join(cacheDir, photo);

        await generateThumbnail(
            input,
            output
        );
    }

    res.json(photos);
});

app.listen(3000, () => {
  console.log("Serveur lancé !");
});