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
        .rotate()
        .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true
        })
        .jpeg({
            quality: 100
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

async function getSpotifyAccessToken() {

    const response = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",
                "Authorization":
                    "Basic " +
                    Buffer.from(
                        "b06f452fa6b1430aba205bb76de63bc8" +
                        ":" +
                        "4bbef44399404352a8457f909efd364b"
                    ).toString("base64")
            },
            body:
                "grant_type=refresh_token" +
                "&refresh_token=" +
                "AQAG4xHSy_uwO2Nc5FdVJ4qAJX2Qi9OKmNTr3m86KZgiHPQpBT4r2pPIkT10zKaI4ZYSaXV0BJV1cJ5wwklO7x4rbDUw2NF8YX5aO1YO4e4b8IIqp_Ye-GuBf5G5rjwwyQY"
        }
    );

    const data = await response.json();

    return data.access_token;
}

app.get("/spotify", async (req, res) => {

    const token =
        await getSpotifyAccessToken();

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    if (response.status === 204) {

        return res.json({
            playing: false
        });
    }

    const data =
        await response.json();

    res.json({
        playing: data.is_playing,
        title: data.item.name,
        artist:
            data.item.artists
                .map(a => a.name)
                .join(", "),
        album:
            data.item.album.name,
        image:
            data.item.album.images[0].url,
        progress: data.progress_ms,
        duration: data.item.duration_ms,
    });
});

app.post("/spotify/next", async (req, res) => {

    const token =
        await getSpotifyAccessToken();

    await fetch(
        "https://api.spotify.com/v1/me/player/next",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    res.sendStatus(200);
});

app.post("/spotify/previous", async (req, res) => {

    const token =
        await getSpotifyAccessToken();

    await fetch(
        "https://api.spotify.com/v1/me/player/previous",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    res.sendStatus(200);
});

app.post("/spotify/toggle", async (req, res) => {

    const token =
        await getSpotifyAccessToken();

    const playerResponse =
        await fetch(
            "https://api.spotify.com/v1/me/player",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

    const player =
        await playerResponse.json();

    if(player.is_playing){

        await fetch(
            "https://api.spotify.com/v1/me/player/pause",
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

    } else {

        await fetch(
            "https://api.spotify.com/v1/me/player/play",
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    }

    res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Serveur lancé !");
});