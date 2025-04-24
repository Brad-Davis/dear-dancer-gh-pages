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

let curInputValue = "";
const fakeInput = document.getElementById('fake-dancer-input')

let liveTextInput = true;

window.addEventListener("message", function(event) {
    
    if (event.data.liveTextInput !== undefined) {
        console.log("input message", event);
        liveTextInput = event.data.liveTextInput;
        toggleTextInput(liveTextInput);
    }
});

function toggleTextInput(liveText) {
    console.log("toggleTextInput", liveText);
    const typingPanel = document.getElementById('text-section-dancer');
    typingPanel.classList.toggle('active', liveText);
    liveTextInput = !liveTextInput;
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
