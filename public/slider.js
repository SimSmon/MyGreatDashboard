let photos = [];
let currentIndex = -1;

async function loadPhotos() {

    const response = await fetch("/photos");

    photos = await response.json();

    console.log("Photos trouvées :", photos);

    if (photos.length > 0) {
        nextPhoto();
    }
}

function nextPhoto() {

    if (photos.length === 0) return;

    let randomIndex;

    do {
        randomIndex = Math.floor(Math.random() * photos.length);
    }
    while (
        photos.length > 1 &&
        randomIndex === currentIndex
    );

    currentIndex = randomIndex;

    document.getElementById("photo").src =
        "/cache/" + photos[randomIndex];
}

loadPhotos();

setInterval(async () => {
    await loadPhotos();
}, 30000);