const settingsMenu = document.getElementById('dancer-settings-panel');

let showSettings = false;
window.addEventListener("message", function(event) {
    console.log(event);
    if (event.data.showSettings !== undefined) {
        showSettings = event.data.showSettings;
        settingsMenu.classList.toggle('active', showSettings);
    }
});

const danceSizeSlider = document.getElementById('dance-size-slider');
const danceRotationSlider = document.getElementById('dance-rotation-slider');

danceSizeSlider.addEventListener('input', () => {
    // isSliderActive = true;
    console.log('hi')
    dancerResizer(danceSizeSlider.value);
});

danceRotationSlider.addEventListener('input', () => {
    // isSliderActive = true;
    dancerRotation(danceRotationSlider.value/360 * Math.PI * 2);
});

danceSizeSlider.addEventListener('touchmove', (event) => {
    // isSliderActive = true;
    const touch = event.touches[0];
    let value = (touch.clientX - danceSizeSlider.getBoundingClientRect().left) / danceSizeSlider.offsetWidth * danceSizeSlider.max;
    if (value > danceSizeSlider.max) value = danceSizeSlider.max;
    if (value < danceSizeSlider.min) value = danceSizeSlider.min;
    danceSizeSlider.value = value;
    dancerResizer(value);
});

danceRotationSlider.addEventListener('touchmove', (event) => {
    // isSliderActive = true;
    const touch = event.touches[0];
    let value = (touch.clientX - danceRotationSlider.getBoundingClientRect().left) / danceRotationSlider.offsetWidth * danceRotationSlider.max;
    if (value > danceRotationSlider.max) value = danceRotationSlider.max;
    if (value < danceRotationSlider.min) value = danceRotationSlider.min;
    danceRotationSlider.value = value;
    dancerRotation(value / 360 * Math.PI * 2);
});



function dancerResizer(size) {
    window.parent.postMessage({size: size + ""}, "*");
}

function dancerRotation(rotation) {
    window.parent.postMessage({rotation: rotation + ""}, "*");
}


const soundToggle= document.getElementById('dancer-sound-toggle');
let soundOn = false;
let floorVisible = true;

soundToggle.addEventListener('click', () => { 
    soundOn = !soundOn;
    window.parent.postMessage({soundOn: soundOn}, "*");
});

soundToggle.addEventListener('touchend', (event) => { 
    soundOn = !soundOn;
    window.parent.postMessage({soundOn: soundOn}, "*");
});

const floorToggle = document.getElementById('dancer-floor-toggle');

floorToggle.addEventListener('click', () => {
    floorVisible = !floorVisible;
    window.parent.postMessage({floorVisible: floorVisible}, "*");
});

floorToggle.addEventListener('touchend', (event) => {
    floorVisible = !floorVisible;
    window.parent.postMessage({floorVisible: floorVisible}, "*");
});

const settingsPanel = document.getElementById('dancer-settings-panel');

if (settingsPanel) {
    const panelRect = settingsPanel.getBoundingClientRect();
    document.documentElement.style.height = `${panelRect.height + 10}px`;
    document.documentElement.style.width = `${panelRect.width + 10}px`;
    document.body.style.height = `${panelRect.height + 10}px`;
    document.body.style.width = `${panelRect.width + 10}px`;
}

settingsMenu.classList.toggle('active');