// script.js

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'; // Add this line

class Queue {
    constructor() {
        this.items = [];
    }

    // Add an element to the queue
    enqueue(element) {
        this.items.push(element);
    }

    clear() {
        this.items = [];
    }

    // Remove an element from the queue
    dequeue() {
        if (this.isEmpty()) {
            return "Queue is empty";
        }
        return this.items.shift();
    }

    deleteLast() {
        if (this.isEmpty()) {
            return "Queue is empty";
        }
        return this.items.pop();
    }

    // Check if the queue is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Get the front element of the queue
    front() {
        if (this.isEmpty()) {
            return "Queue is empty";
        }
        return this.items[0];
    }

    // Get the size of the queue
    size() {
        return this.items.length;
    }

    toString() {
        let output = "";
        for (let i = 0; i < this.items.length; i++) {
            output += String.fromCharCode(this.items[i] + 65);
        }
        return output;
    }
}


const canvas = document.getElementById('three-canvas');
const fullDancer = document.getElementById('full-dancer');
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize(canvas.clientHeight, canvas.clientWidth);
renderer.setPixelRatio( window.devicePixelRatio );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
// scene.background = new THREE.Color(0xffffff); // Set background color to black
// camera.position.z = 200;
camera.position.z = 3;
camera.position.y = 1;
camera.position.x = 0;
window.camera = camera;


const typewriterClicks = [new Audio ('https://github.com/Brad-Davis/dear-dancer-gh-pages/raw/refs/heads/main/typewriter1.mp3'), new Audio('https://github.com/Brad-Davis/dear-dancer-gh-pages/raw/refs/heads/main/typewriter2.mp3'), new Audio('https://github.com/Brad-Davis/dear-dancer-gh-pages/raw/refs/heads/main/typewriter3.mp3')];
const typewriterNewline = new Audio('https://github.com/Brad-Davis/dear-dancer-gh-pages/raw/refs/heads/main/typewriterNewline.mp3');

// Add lights to the scene
// const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Increase intensity to make it brighter
// directionalLight.position.set(1, 1, 1).normalize();
// scene.add(directionalLight);

// const pointLight = new THREE.PointLight(0xffffff, 2, 100); // Increase intensity to make it brighter
// pointLight.position.set(5, 5, 5);
// scene.add(pointLight);


const spotLight = new THREE.SpotLight( 0xffffff, 5000, 100, Math.PI / 4, 0.5, 2 );
// spotLight.position.set( 0, 4, 0 );
// spotLight.target.position.set( 0, 0, -1 );
scene.add(spotLight);
spotLight.castShadow = true;

// Create a white floor geometry
const floorGeometry = new THREE.CircleGeometry(1, 64);

// Create a material for the floor that can receive shadows
const texture = new THREE.TextureLoader().load('./map7.jpg');
const floorMaterial = new THREE.MeshStandardMaterial({ 
    alphaMap: texture, 
    color: 0x25408f,
    transparent: true,
});
// floorMaterial.alphaMap.repeat.set(2,2)
floorMaterial.metalness = 1.0;

// Combine the geometry and material to create a mesh
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// Position the floor beneath the model
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;

// Enable shadow receiving for the floor
floor.receiveShadow = true;

// Add the floor to the scene
scene.add(floor);



// const spotLightHelper = new THREE.SpotLightHelper( spotLight );
// scene.add( spotLightHelper );

// Add controls to the scene
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;

// Add this after the scene and camera are created
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
// outlinePass.edgeStrength = 3.0;
// outlinePass.edgeGlow = 1.0;
// outlinePass.edgeThickness = 1.0;
// outlinePass.pulsePeriod = 0;
// outlinePass.visibleEdgeColor.set('#ffffff');
// outlinePass.hiddenEdgeColor.set('#ffffff');
// composer.addPass(outlinePass);

const fontLoader = new FontLoader();



const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
composer.addPass(effectFXAA);

let currentAnimationIndex = 0;



const loader = new GLTFLoader();

function setWeight( action, weight ) {

    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );

}

let mixer;
let animations;
let font;
let updateSpeed = 1.6;
let globalFadeDuration = 500 / updateSpeed; // 1ms
let skeleton;
let clock;
let alphabeticalAnimations;
let alphabeticalActions;
let weights;
let globalLetter;


let globalDancer;

loader.load('./allLettersV3.glb', async (gltf) => {
    dancerResizer(350);
    clock = new THREE.Clock();
    gltf.scene.scale.set(1,1, 1); 
    globalDancer = gltf.scene;
    gltf.scene.position.set(0, 0, 0);

    const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), scene, camera);
    outlinePass.selectedObjects = [...gltf.scene.children];
    composer.addPass(outlinePass);

    const cloth = gltf.scene.getObjectByName('Cloth');
    cloth.visible = false;

    const ttfLoader = new TTFLoader();
    await ttfLoader.load('./fonts/SpecialElite-Regular.ttf', (json) => {
        font = fontLoader.parse(json);
    });

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
        }
    });

    // Assuming you have a floor object named 'floor'
    floor.receiveShadow = true;

    gltf.scene.getObjectByName('Hips')

    scene.add(gltf.scene);

    skeleton = new THREE.SkeletonHelper( gltf.scene );
    skeleton.visible = false;
    scene.add( skeleton );


    // animations = await getAllAnimations(files);
    animations = gltf.animations;

    // Add this before the alphabeticalAnimation array
    weights = new Array(25).fill(0);
    weights[0] = 0; 

    

    // Function to update weights and transition between subclips
    function updateWeights() {

        alphabeticalActions.forEach((action, index) => {
            setWeight(action, weights[index]);
        });
    }


    alphabeticalAnimations = [ 
        THREE.AnimationUtils.subclip( animations[1], 'A', 0, 112 ), 
        THREE.AnimationUtils.subclip( animations[1], 'B', 105, 235 ), 
        THREE.AnimationUtils.subclip( animations[1], 'C', 235, 335 ), 
        THREE.AnimationUtils.subclip( animations[1], 'D', 335, 455 ), 
        THREE.AnimationUtils.subclip( animations[1], 'E', 455, 625 ), 
        THREE.AnimationUtils.subclip( animations[1], 'F', 625, 780 ), 
        THREE.AnimationUtils.subclip( animations[1], 'G', 780, 915 ), 
        THREE.AnimationUtils.subclip( animations[1], 'H', 945, 1042 ), 
        THREE.AnimationUtils.subclip( animations[1], 'I', 1042, 1170 ), 
        THREE.AnimationUtils.subclip( animations[1], 'J', 1170, 1280 ), 
        THREE.AnimationUtils.subclip( animations[1], 'K', 1300, 1460 ), 
        THREE.AnimationUtils.subclip( animations[1], 'L', 1460, 1590 ), 
        THREE.AnimationUtils.subclip( animations[1], 'M', 1610, 1752 ), 
        THREE.AnimationUtils.subclip( animations[1], 'N', 1752, 1863 ), 
        THREE.AnimationUtils.subclip( animations[1], 'O', 1895, 2017 ), 
        THREE.AnimationUtils.subclip( animations[1], 'P', 2048, 2158 ), 
        THREE.AnimationUtils.subclip( animations[1], 'Q', 2180, 2328 ), 
        THREE.AnimationUtils.subclip( animations[1], 'R', 2365, 2520 ), 
        THREE.AnimationUtils.subclip( animations[1], 'S', 2520, 2650 ), 
        THREE.AnimationUtils.subclip( animations[1], 'T', 2650, 2800 ), 
        THREE.AnimationUtils.subclip( animations[1], 'U', 2850, 2990 ), 
        THREE.AnimationUtils.subclip( animations[1], 'V', 2990, 3120 ), 
        THREE.AnimationUtils.subclip( animations[1], 'W', 3120, 3260 ), 
        THREE.AnimationUtils.subclip( animations[1], 'X', 3300, 3410 ), 
        THREE.AnimationUtils.subclip( animations[1], 'Y', 3410, 3550 ), 
        THREE.AnimationUtils.subclip( animations[1], 'Z', 3600, 3870 ) ];

    // Add this after the alphabeticalAnimations array
    const mixer = new THREE.AnimationMixer(gltf.scene);
    alphabeticalActions = alphabeticalAnimations.map((clip, index) => {
        const action = mixer.clipAction(clip);
        action.setEffectiveWeight(weights[index]);
        action.setLoop(THREE.LoopPingPong); // Set the loop mode to ping pong
        action.play();
        return action;
    });

    // let currentActionIndex = 0;
    // let curAnimation = alphabeticalAnimations[0];

    // curAnimation.addEventListener( 'finished', onFinishCurAnimcurAnimation);

    // function onFinishCurAnimcurAnimation() {
    //     onCompleteActionFadeToNextAction();
    //     currentActionIndex = currentActionIndex + 1 >= alphabeticalActions.length ? 0 : currentActionIndex + 1;
    //     curAnimation.removeEventListener( 'finished', onFinishCurAnimcurAnimation );
    //     curAnimation = alphabeticalActions[currentActionIndex];
    //     curAnimation.mixer.addEventListener( 'finished', onFinishCurAnimcurAnimation );
    // }


    // MAIN ANIMATION LOOP
    function animate() {
        const hips = gltf.scene.getObjectByName('Hips');
        const hipsWorldPosition = hips.localToWorld(new THREE.Vector3(0, 0, 0));
        const hipsFrontPosition = new THREE.Vector3(hipsWorldPosition.x, 1, hipsWorldPosition.z);
        camera.position.x = hipsFrontPosition.x;
        camera.position.y = hipsFrontPosition.y;
        camera.position.z = hipsFrontPosition.z + 3;

        floor.position.x = hipsWorldPosition.x;
        floor.position.z = hipsWorldPosition.z;

        if (globalLetter) {
            globalLetter.position.set(hipsWorldPosition.x - 0.5, 0.5, hipsWorldPosition.z - 2);
        }

        spotLight.position.set(hipsWorldPosition.x, 5, hipsWorldPosition.z - 10);
        spotLight.target.position.set(hipsWorldPosition.x, 0, hipsWorldPosition.z + 10);

        requestAnimationFrame(animate);
        mixer.update(clock.getDelta() * updateSpeed);
        updateWeights();
        composer.render();
    }

    animate();

}, undefined, function (error) {
    console.error(error);
});


function fadeBetweenWeights(actionIndex, fadeDuration) {
    // Set the previous action's weight to 1
    prevActionIndex = weights.findIndex(weight => weight > 0);


    if (prevActionIndex !== -1 && prevActionIndex !== actionIndex) {
        setWeight(alphabeticalActions[prevActionIndex], 1);
    }

    // Set the current action's weight to 0
    if (prevActionIndex !== actionIndex) {
        setWeight(alphabeticalActions[actionIndex], 0);
    }

    if (weights[actionIndex] <= 0) {
        alphabeticalActions[actionIndex].reset();
    }

    // console.log("fadeBetweenWeights");

    // Start the transition
    const transitionStartTime = Date.now();

    function updateTransition() {
        const elapsedTime = Date.now() - transitionStartTime;
        const t = Math.min(elapsedTime / fadeDuration, 1);

        // Interpolate weights
        const prevWeight = 1 - t;
        const currentWeight = t;
        if (prevActionIndex !== - 1 && prevActionIndex !== actionIndex) {
            setWeight(alphabeticalActions[prevActionIndex], prevWeight);
        }
        if (prevActionIndex !== actionIndex) {
            setWeight(alphabeticalActions[actionIndex], currentWeight);
        }
        
        if (t < 1) {
            requestAnimationFrame(updateTransition);
        } else {
            // Ensure final weights are set
            if (prevActionIndex !== -1 && prevActionIndex !== actionIndex) {
                setWeight(alphabeticalActions[prevActionIndex], 0);
            }
            setWeight(alphabeticalActions[actionIndex], 1);
            weights[actionIndex] = 1;
            if (prevActionIndex !== -1 && prevActionIndex !== actionIndex) {
                weights[prevActionIndex] = 0;
            } 
        }
    }

    updateTransition();
}

const textQueue = new Queue();

let isAnimationRunning = false;
let prevActionIndex = null;

async function runQueue() {
    while (!textQueue.isEmpty()) {
        const index = textQueue.dequeue();
        curInputIndex += 1;
        if (index === undefined) {
            continue;
        }
        if (index == 26) {
            moveOnEnter();
            await new Promise(resolve => setTimeout(resolve, globalFadeDuration));
            // updateTextQueueDisplay();
            continue;
        }
        moveOnType(20);
        playClickSound();
        
        showInputText(curInputIndex)
        const duration = alphabeticalAnimations[index].duration / updateSpeed;
        //Remove letter!
        fadeBetweenWeights(index, globalFadeDuration);
        // const letter = spawnLetter(index);
        // scene.add(letter);
        await new Promise(resolve => setTimeout(resolve, duration * 1000 - globalFadeDuration));
        // scene.remove(letter);
        // updateTextQueueDisplay();
        prevActionIndex = index;
    }
    fadeToZero();
    enableTextInput();
    isAnimationRunning = false;
}


let prevLength = 0;
let timer;

async function handleLiveInput(event) {
    if (!liveTextInput) {
        return;
    }
    const key = event.key;
    if (key === 'Backspace') {
        textQueue.deleteLast(); // Remove item from end of queue
        return;
    }
    if (key === 'Enter') {
        moveOnEnter();
    }
    if (key.length > 1 && key !== ' ') {
        return;
    }
    const letter = String.fromCharCode(key.charCodeAt(0)).toUpperCase();
    
    let index = letter.charCodeAt(0) - 65;

    if (index < 0 || index > 25) {
        if (key === ' ') {
            index = 26; // Assuming space is at index 26
        } else {
            return;
        }
    }
    
    textQueue.enqueue(index);
    // updateTextQueueDisplay();
    if (!isAnimationRunning) {
        // console.log("starting runQueue");
        isAnimationRunning = true;
        runQueue();
    }
    
    clearTimeout(timer);
    timer = setTimeout(() => {
        textQueue.clear();
        // console.log("clearing queue");
        // updateTextQueueDisplay();
    }, 4000);
}

const sendDancerTextButton = document.getElementById('send-dancer-text');

sendDancerTextButton.addEventListener('click', sendDancerText);
const textInputDancer = document.getElementById('text-input-dancer');
textInputDancer.addEventListener('keydown', handleSendDancerTextKey);

function handleSendDancerTextKey(event) {
    if (event.key === 'Enter') {
        sendDancerText();
    }
}

let curInputIndex = 0;
function sendDancerText() {
    const textInput = document.getElementById('text-input-dancer');
    const text = textInput.value;
    disableTextInput();
    curInputValue = text;
    curInputIndex = 0;
    for(let i = 0; i < text.length; i++) {
        const key = text[i];
        if (key.length > 1 && key !== ' ') {
            return;
        }
        const letter = String.fromCharCode(key.charCodeAt(0)).toUpperCase();
        
        let index = letter.charCodeAt(0) - 65;
    
        if (index < 0 || index > 25) {
            if (key === ' ') {
                index = 26; // Assuming space is at index 26
            } else {
                return;
            }
        }
        
        textQueue.enqueue(index);
        // updateTextQueueDisplay();
        if (!isAnimationRunning) {
            isAnimationRunning = true;
            runQueue();
        }
    }
}

function dancerRotation(rotation) {
    globalDancer.rotation.y = rotation;
}

// Resize the renderer when the window is resized



function spawnLetter(index) {
    const charCode = index + 97;

    const letter = "" + String.fromCharCode(charCode);
    const geometry = new TextGeometry(letter, {
        font: font,
        size: 1.6,
        depth: 0.05,
    });
    
    const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.position.y += 0.5;
    textMesh.position.z -= 0.5;
    globalLetter = textMesh;
    // scene.add(textMesh);
    return textMesh;
}

function fadeToZero() {
    for (let i = 0; i < weights.length; i++) {
        if (weights[i] > 0) {
            fadeWeightToValue(i, 0, globalFadeDuration);
        }
    }
    
}

function fadeWeightToValue(index, value, duration) {
    const startValue = weights[index];
    const startTime = Date.now();
    const endTime = startTime + duration;

    function updateWeight() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;
        const currentValue = startValue + (value - startValue) * progress;
        weights[index] = currentValue;

        if (currentTime < endTime) {
            requestAnimationFrame(updateWeight);
        }
    }

    updateWeight();
}

function updateTextQueueDisplay() {
    const textQueueDisplay = document.getElementById('textQueueDisplay');
    textQueueDisplay.innerHTML = textQueue.toString();
}

let curClickIndex = 0;

let soundOn = false;
function playClickSound() {
    if (soundOn) {
        typewriterClicks[curClickIndex].play();
        curClickIndex = (curClickIndex + 1) % typewriterClicks.length;
    }
}

const soundToggle= document.getElementById('dancer-sound-toggle');

soundToggle.addEventListener('click', () => { 
    soundOn = !soundOn;
});

soundToggle.addEventListener('touchend', (event) => { 
    soundOn = !soundOn;
});

const floorToggle = document.getElementById('dancer-floor-toggle');

floorToggle.addEventListener('click', () => {
    floor.visible = !floor.visible;
});

floorToggle.addEventListener('touchend', (event) => {
    console.log(event);
    floor.visible = !floor.visible;
});


function moveOnType(amount) {
    const screenWidth = window.innerWidth;
    const canvasWidth = canvas.offsetWidth;
    const currentLeft = parseInt(canvas.style.left) || 0;
    const newLeft = currentLeft + amount; // Adjust the shift amount as needed

    if (newLeft + canvasWidth > screenWidth) {
        moveOnEnter();
    } else {
        canvas.style.left = newLeft + 'px';
    }
}

function moveOnEnter() {
    const screenWidth = window.innerWidth;
    const canvasWidth = canvas.offsetWidth;
    if (soundOn) {
        typewriterNewline.play();
    }

    canvas.style.left = 0 + 'px';
}

window.fadeBetweenWeights = fadeBetweenWeights; 

document.addEventListener('keydown', handleLiveInput);



const settingsButton = document.getElementById('dancer-settings-button');

settingsButton.addEventListener('click', toggleSettings);
settingsButton.addEventListener('touchend', toggleSettings);

const settingsMenu = document.getElementById('dancer-settings-panel');

settingsMenu.addEventListener('mousedown', (event) => startDrag(event, settingsMenu));
settingsMenu.addEventListener('mousemove', (event) => drag(event, settingsMenu));
settingsMenu.addEventListener('mouseup', endDrag);
settingsMenu.addEventListener('mouseleave', endDrag);

settingsMenu.addEventListener('touchstart', (event) => startDrag(event, settingsMenu));
settingsMenu.addEventListener('touchmove', (event) => drag(event, settingsMenu));
settingsMenu.addEventListener('touchend', endDrag);
settingsMenu.addEventListener('touchcancel', endDrag);

function toggleSettings() {
    settingsMenu.classList.toggle('active');
    settingsButton.classList.toggle('active');
}

const textInputButton = document.getElementById('dancer-input-button');
textInputButton.addEventListener('click', toggleTextInput);
textInputButton.addEventListener('touchend', toggleTextInput);

let liveTextInput = true;

function toggleTextInput() {
    const typingPanel = document.getElementById('text-section-dancer');
    typingPanel.classList.toggle('active');
    liveTextInput = !liveTextInput;
    textInputButton.classList.toggle('active');
}  

// ...

let isDragging = false;
let dancerInitialX = fullDancer.offsetLeft;
let dancerInitialY = fullDancer.offsetTop;
let settingsInitialX = settingsMenu.offsetLeft;
let settingsInitialY = settingsMenu.offsetTop;

fullDancer.addEventListener('mousedown', (event) => startDrag(event, fullDancer));
fullDancer.addEventListener('mousemove', (event) => drag(event, fullDancer));
fullDancer.addEventListener('mouseup', endDrag);
fullDancer.addEventListener('mouseleave', endDrag);

fullDancer.addEventListener('touchstart', (event) => startDrag(event, fullDancer));
fullDancer.addEventListener('touchmove', (event) => drag(event, fullDancer));
fullDancer.addEventListener('touchend', endDrag);
fullDancer.addEventListener('touchcancel', endDrag);

function startDrag(event, self) {
    isDragging = true;

    const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;
    console.log(clientX, clientY);
    isDragging = true;
    if (self.id + "" === 'full-dancer') {
        dancerInitialX = clientX;
        dancerInitialY = clientY;
    } else {
        settingsInitialX = clientX;
        settingsInitialY = clientY;
    }
    
}

let isSliderActive = false;

function drag(event, self) {
    const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;
    if (isDragging && !isSliderActive) {
        if (self.id + "" === 'full-dancer') {
            const dx = clientX - dancerInitialX;
            const dy = clientY - dancerInitialY;
            const currentX = self.offsetLeft + dx * 10;
            const currentY = self.offsetTop + dy * 10;
            const minX = self.offsetWidth/2  - 50;
            const minY = self.offsetHeight/2  - 30;
            const maxX = window.innerWidth - minX;
            const maxY = window.innerHeight - minY;
            const constrainedX = Math.max(minX, Math.min(maxX, currentX));
            const constrainedY = Math.max(minY, Math.min(maxY, currentY));
            self.style.left = constrainedX + 'px';
            self.style.top = constrainedY + 'px';
            dancerInitialX = clientX;
            dancerInitialY = clientY;
        } else {
            const dx = clientX - settingsInitialX;
            const dy = clientY - settingsInitialY;
            const currentX = self.offsetLeft + dx;
            const currentY = self.offsetTop + dy;
            const minX = 0;
            const minY = 0;
            const maxX = window.innerWidth - minX;
            const maxY = window.innerHeight - minY;
            const constrainedX = Math.max(minX, Math.min(maxX, currentX));
            const constrainedY = Math.max(minY, Math.min(maxY, currentY));
            self.style.left = constrainedX + 'px';
            self.style.top = constrainedY + 'px';
            settingsInitialX = clientX;
            settingsInitialY = clientY;
        }
        
    }
}


function endDrag() {
    isDragging = false;
}

// ...

const danceSizeSlider = document.getElementById('dance-size-slider');
const danceRotationSlider = document.getElementById('dance-rotation-slider');

danceSizeSlider.addEventListener('input', () => {
    isSliderActive = true;
    console.log('hi')
    dancerResizer(danceSizeSlider.value);
});

danceRotationSlider.addEventListener('input', () => {
    isSliderActive = true;
    dancerRotation(danceRotationSlider.value/360 * Math.PI * 2);
});

danceSizeSlider.addEventListener('touchmove', (event) => {
    isSliderActive = true;
    const touch = event.touches[0];
    let value = (touch.clientX - danceSizeSlider.getBoundingClientRect().left) / danceSizeSlider.offsetWidth * danceSizeSlider.max;
    if (value > danceSizeSlider.max) value = danceSizeSlider.max;
    if (value < danceSizeSlider.min) value = danceSizeSlider.min;
    danceSizeSlider.value = value;
    dancerResizer(value);
});

danceRotationSlider.addEventListener('touchmove', (event) => {
    isSliderActive = true;
    const touch = event.touches[0];
    let value = (touch.clientX - danceRotationSlider.getBoundingClientRect().left) / danceRotationSlider.offsetWidth * danceRotationSlider.max;
    if (value > danceRotationSlider.max) value = danceRotationSlider.max;
    if (value < danceRotationSlider.min) value = danceRotationSlider.min;
    danceRotationSlider.value = value;
    dancerRotation(value / 360 * Math.PI * 2);
});

danceSizeSlider.addEventListener('touchstart', () => {
    isSliderActive = true;
});

danceSizeSlider.addEventListener('touchend', () => {
    isSliderActive = false;
});

danceRotationSlider.addEventListener('touchstart', () => {
    isSliderActive = true;
});

danceRotationSlider.addEventListener('touchend', () => {
    isSliderActive = false;
});

danceSizeSlider.addEventListener('mousedown', () => {
    isSliderActive = true;
});

danceSizeSlider.addEventListener('mouseup', () => {
    isSliderActive = false;
});

danceRotationSlider.addEventListener('mousedown', () => {
    isSliderActive = true;
});

danceRotationSlider.addEventListener('mouseup', () => {
    isSliderActive = false;
});

function dancerResizer(size) {
    const controls = document.getElementById('three-controls');
    controls.style.width = `${size}px`;
    controls.style.top = `-${size * (1/4)}px`;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    fullDancer.style.width = `${size}px`;
    fullDancer.style.height = `${size}px`;
    document.body.style.width = `${size}px`;
    document.body.style.height = `${size}px`;
    document.documentElement.style.width = `${size}px`;
    document.documentElement.style.height = `${size}px`;
}

function disableTextInput() {
    const textInput = document.getElementById('text-input-dancer');
    const buttonInput = document.getElementById('send-dancer-text');
    if (textInput.value === "") {
        return;
    }
    buttonInput.disabled = true;
    textInput.disabled = true;
}

let curInputValue = "";
const fakeInput = document.getElementById('fake-dancer-input')
function showInputText(curIndex) {
    const textInput = document.getElementById('text-input-dancer');
    textInput.value = " ";
    const beforeText = curInputValue.substring(0, curIndex);
    const afterText = curInputValue.substring(curIndex);
    const coloredText = `<span style="">${beforeText}</span><span style="opacity: 50%">${afterText}</span>`;
    fakeInput.style.width = textInput.offsetWidth + 'px';
    fakeInput.innerHTML = coloredText;
}

function enableTextInput() {
    const textInput = document.getElementById('text-input-dancer');
    textInput.disabled = false;
    textInput.value = "";
    fakeInput.innerHTML = "";
    const buttonInput = document.getElementById('send-dancer-text');
    buttonInput.disabled = false;
}



dancerResizer(350);

// queue.js

