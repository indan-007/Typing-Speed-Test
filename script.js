document.addEventListener('DOMContentLoaded', () => {
    const sentences = [
        "The quick brown fox jumps over the lazy dog.",
        "Pack my box with five dozen liquor jugs.",
        "How vexingly quick daft zebras jump!",
        "The five boxing wizards jump quickly.",
        "Bright vixens jump; dozy fowl quack.",
        "Jackdaws love my big sphinx of quartz.",
        "The quick onyx goblin jumps over the lazy dwarf."
    ];

    const sentenceEl = document.getElementById('sentence');
    const inputEl = document.getElementById('input');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsEl = document.getElementById('results');
    const wpmEl = document.getElementById('wpm');
    const accuracyEl = document.getElementById('accuracy');
    const timeEl = document.getElementById('time');

    let sentence = '';
    let testActive = false;
    let startTime;

    function getRandomSentence() {
        return sentences[Math.floor(Math.random() * sentences.length)];
    }

    function startTest() {
        if (testActive) return;

        sentence = getRandomSentence();
        sentenceEl.innerHTML = '';
        sentence.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            sentenceEl.appendChild(charSpan);
        });

        inputEl.value = '';
        inputEl.focus();
        inputEl.disabled = false;

        resultsEl.classList.add('hidden');
        testActive = true;
        startTime = new Date().getTime();
    }

    function endTest() {
        testActive = false;
        inputEl.disabled = true;

        const endTime = new Date().getTime();
        const elapsedTime = (endTime - startTime) / 1000; // in seconds

        const typedText = inputEl.value;
        const typedWords = typedText.trim().split(/\s+/).length;
        const timeInMinutes = elapsedTime / 60;

        let wpm = 0;
        if (timeInMinutes > 0) {
            wpm = (typedWords / timeInMinutes).toFixed(2);
        }

        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === sentence[i]) {
                correctChars++;
            }
        }
        const accuracy = ((correctChars / sentence.length) * 100).toFixed(2);

        wpmEl.innerText = wpm;
        accuracyEl.innerText = accuracy;
        timeEl.innerText = elapsedTime.toFixed(2);
        resultsEl.classList.remove('hidden');
    }

    function resetTest() {
        testActive = false;
        inputEl.value = '';
        inputEl.disabled = true;
        sentenceEl.innerHTML = 'Click "Start Test" to begin.';
        resultsEl.classList.add('hidden');
        startTime = null;
    }

    inputEl.addEventListener('input', () => {
        if (!testActive) return;

        const typedText = inputEl.value;
        const sentenceChars = sentenceEl.querySelectorAll('span');

        let allCorrect = true;
        sentenceChars.forEach((charSpan, index) => {
            const typedChar = typedText[index];
            if (typedChar == null) {
                charSpan.classList.remove('correct', 'incorrect');
                allCorrect = false;
            } else if (typedChar === charSpan.innerText) {
                charSpan.classList.add('correct');
                charSpan.classList.remove('incorrect');
            } else {
                charSpan.classList.add('incorrect');
                charSpan.classList.remove('correct');
                allCorrect = false;
            }
        });

        if (typedText.length === sentence.length && allCorrect) {
            endTest();
        }
    });

    startBtn.addEventListener('click', startTest);
    resetBtn.addEventListener('click', resetTest);

    resetTest(); // Initial state
});
