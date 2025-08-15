document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sentenceEl = document.getElementById('sentence');
    const inputEl = document.getElementById('input');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsEl = document.getElementById('results');
    const wpmEl = document.getElementById('wpm');
    const accuracyEl = document.getElementById('accuracy');
    const timeEl = document.getElementById('time');
    const timerEl = document.getElementById('timer');
    const timerContainer = document.getElementById('timer-container');
    const liveStats = document.getElementById('live-stats');
    const liveWpm = document.getElementById('live-wpm');
    const liveAccuracy = document.getElementById('live-accuracy');
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const timeRadios = document.querySelectorAll('input[name="time"]');
    const timeSelect = document.querySelector('.time-select');
    const settingsEl = document.querySelector('.settings');
    const historyBody = document.getElementById('history-body');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const audioCorrect = document.getElementById('audio-correct');
    const audioIncorrect = document.getElementById('audio-incorrect');

    // State
    let sentence = '';
    let testActive = false;
    let startTime;
    let timerInterval;
    let liveStatsInterval;
    let timeLeft;
    let totalCorrectChars = 0;
    let totalIncorrectChars = 0;

    const API_URL = 'https://api.quotable.io/quotes/random';
    const FALLBACK_SENTENCE = "The quick brown fox jumps over the lazy dog.";

    async function getRandomSentence() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch quote');
            const data = await response.json();
            return data[0].content;
        } catch (error) {
            console.error("Error fetching sentence:", error);
            return FALLBACK_SENTENCE;
        }
    }

    async function loadNextSentence() {
        sentenceEl.innerHTML = 'Loading...';
        sentence = await getRandomSentence();
        sentenceEl.innerHTML = '';
        sentence.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            sentenceEl.appendChild(charSpan);
        });
        inputEl.value = '';
    }

    async function startTest() {
        if (testActive) return;

        const mode = document.querySelector('input[name="mode"]:checked').value;

        testActive = true;
        resultsEl.classList.add('hidden');
        liveStats.classList.remove('hidden');
        timerContainer.classList.add('hidden'); // Hide timer by default
        inputEl.value = '';
        inputEl.focus();
        inputEl.disabled = false;
        settingsEl.querySelectorAll('input').forEach(input => input.disabled = true);

        totalCorrectChars = 0;
        totalIncorrectChars = 0;

        await loadNextSentence();

        if (mode === 'timed') {
            const timeLimit = parseInt(document.querySelector('input[name="time"]:checked').value);
            timeLeft = timeLimit;
            timerContainer.classList.remove('hidden');
            timerEl.innerText = timeLeft;
            timerInterval = setInterval(() => {
                timeLeft--;
                timerEl.innerText = timeLeft;
                if (timeLeft === 0) {
                    endTest();
                }
            }, 1000);
        }
        startTime = new Date().getTime();
        liveStatsInterval = setInterval(updateLiveStats, 1000);
    }

    function updateLiveStats() {
        if (!testActive) return;

        const elapsedTime = (new Date().getTime() - startTime) / 1000;
        if (elapsedTime === 0) return;

        const timeInMinutes = elapsedTime / 60;
        const wpm = ((totalCorrectChars / 5) / timeInMinutes).toFixed(2);

        const totalAttempted = totalCorrectChars + totalIncorrectChars;
        const accuracy = totalAttempted > 0 ? ((totalCorrectChars / totalAttempted) * 100).toFixed(2) : 100;

        liveWpm.innerText = wpm < 0 ? 0 : wpm;
        liveAccuracy.innerText = accuracy;
    }

    function endTest() {
        testActive = false;
        inputEl.disabled = true;
        clearInterval(timerInterval);
        clearInterval(liveStatsInterval);

        const mode = document.querySelector('input[name="mode"]:checked').value;
        let wpm = 0;
        let accuracy = 0;
        let timeTaken = 0;
        let finalMode = 'Sentence';

        if (mode === 'timed') {
            const timeLimit = parseInt(document.querySelector('input[name="time"]:checked').value);
            timeTaken = timeLimit;
            finalMode = `Timed ${timeLimit}s`;
            const timeInMinutes = timeLimit / 60;
            wpm = ((totalCorrectChars / 5) / timeInMinutes).toFixed(2);
            const totalAttemptedChars = totalCorrectChars + totalIncorrectChars;
            accuracy = totalAttemptedChars > 0 ? ((totalCorrectChars / totalAttemptedChars) * 100).toFixed(2) : 0;
        } else { // Sentence mode
            const endTime = new Date().getTime();
            timeTaken = ((endTime - startTime) / 1000).toFixed(2);
            const timeInMinutes = timeTaken / 60;
            const typedWords = sentence.trim().split(/\s+/).length;
            if (timeInMinutes > 0) {
                wpm = (typedWords / timeInMinutes).toFixed(2);
            }
            let correctChars = 0;
            for (let i = 0; i < sentence.length; i++) {
                if (inputEl.value[i] === sentence[i]) {
                    correctChars++;
                }
            }
            accuracy = ((correctChars / sentence.length) * 100).toFixed(2);
        }

        wpmEl.innerText = wpm;
        accuracyEl.innerText = accuracy;
        timeEl.innerText = timeTaken;
        resultsEl.classList.remove('hidden');
        timerContainer.classList.add('hidden');
        liveStats.classList.add('hidden');
        settingsEl.querySelectorAll('input').forEach(input => input.disabled = false);

        saveResult(finalMode, wpm, accuracy);
        displayHistory();
    }

    function resetTest() {
        testActive = false;
        inputEl.value = '';
        inputEl.disabled = true;
        sentenceEl.innerHTML = 'Click "Start Test" to begin.';
        resultsEl.classList.add('hidden');
        timerContainer.classList.add('hidden');
        liveStats.classList.add('hidden');
        clearInterval(timerInterval);
        clearInterval(liveStatsInterval);
        startTime = null;
        settingsEl.querySelectorAll('input').forEach(input => input.disabled = false);
    }

    function playSound(audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => {
            // Ignore errors from rapid playback attempts
        });
    }

    function handleKeyPress(key) {
        const keyEl = document.querySelector(`.key[data-key="${key.toLowerCase()}"]`);
        if (keyEl) {
            keyEl.classList.add('key-pressed');
        }
    }

    function handleKeyRelease(key) {
        const keyEl = document.querySelector(`.key[data-key="${key.toLowerCase()}"]`);
        if (keyEl) {
            keyEl.classList.remove('key-pressed');
        }
    }

    // Using 'input' event to handle text changes from any source (typing, paste, etc.)
    inputEl.addEventListener('input', async () => {
        if (!testActive) return;

        const mode = document.querySelector('input[name="mode"]:checked').value;
        const typedText = inputEl.value;
        const sentenceChars = sentenceEl.querySelectorAll('span');

        let allCorrect = true;
        sentenceChars.forEach((charSpan, index) => {
            const typedChar = typedText[index];
            const isCorrect = typedChar === charSpan.innerText;

            if (typedChar == null) {
                charSpan.classList.remove('correct', 'incorrect');
                allCorrect = false;
            } else if (isCorrect) {
                charSpan.classList.add('correct');
                charSpan.classList.remove('incorrect');
                if(mode === 'timed' && !charSpan.dataset.counted) {
                    totalCorrectChars++;
                    charSpan.dataset.counted = true;
                }
            } else {
                charSpan.classList.add('incorrect');
                charSpan.classList.remove('correct');
                if(mode === 'timed' && !charSpan.dataset.counted) {
                    totalIncorrectChars++;
                    charSpan.dataset.counted = true;
                }
                allCorrect = false;
            }
        });

        // Sound is played on keydown, so logic is moved there.
        // But we check for completion here.
        if (typedText.length === sentence.length && allCorrect) {
            if (mode === 'timed') {
                await loadNextSentence();
            } else {
                endTest();
            }
        }
    });

    // Using 'keydown' for visual/audio feedback before character appears in input
    inputEl.addEventListener('keydown', (e) => {
        if (!testActive) return;

        handleKeyPress(e.key);

        const typedChar = e.key;
        // Only handle printable characters
        if (typedChar.length > 1 && typedChar !== ' ') return;

        const currentIndex = inputEl.value.length;
        const expectedChar = sentence[currentIndex];

        if (typedChar === expectedChar) {
            playSound(audioCorrect);
        } else {
            playSound(audioIncorrect);
        }
    });

    inputEl.addEventListener('keyup', (e) => {
        handleKeyRelease(e.key);
    });

    function saveResult(mode, wpm, accuracy) {
        const result = {
            mode,
            wpm,
            accuracy,
            date: new Date().toLocaleString()
        };
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        history.push(result);
        localStorage.setItem('typingHistory', JSON.stringify(history));
    }

    function displayHistory() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        historyBody.innerHTML = ''; // Clear previous entries
        history.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.mode}</td>
                <td>${result.wpm}</td>
                <td>${result.accuracy}%</td>
                <td>${result.date}</td>
            `;
            historyBody.appendChild(row);
        });
    }

    function clearHistory() {
        localStorage.removeItem('typingHistory');
        displayHistory();
    }

    modeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'timed') {
                timeSelect.classList.remove('hidden');
            } else {
                timeSelect.classList.add('hidden');
            }
        });
    });

    startBtn.addEventListener('click', startTest);
    resetBtn.addEventListener('click', resetTest);
    clearHistoryBtn.addEventListener('click', clearHistory);

    resetTest(); // Initial state
    displayHistory(); // Load history on page load
});
