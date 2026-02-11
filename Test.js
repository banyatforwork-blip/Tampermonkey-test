// ==UserUserScript==
// @name         Gimkit Answer Logger & Highlighter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Saves correct answers and highlights them in subsequent rounds.
// @author       Assistant
// @match        *://*.gimkit.com/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    // CSS Class Mapping (Gimkit often obfuscates these; these match your source script)
    const classes = {
        "a$": "bUshEA",
        "YM": "ihVPuW",
        "wv": "imvEeI",
        "Wr": "hitgke",
        "yt": "iGaLUl",
        "iH": "cuMdqS",
        "Rw": "ZMQKI"
    };

    let savedAnswers = [];
    let scriptRunning = false;

    // --- Helper Functions ---

    function isInputPresent() {
        return document.getElementsByClassName(classes.iH).length > 0;
    }

    function saveAnswer(question, answer) {
        if (savedAnswers.some(item => item.question === question)) return;
        savedAnswers.push({ question, answer });
        console.log("Answer Saved:", answer);
    }

    function isCorrectResponse() {
        // Checks if the 'correct' feedback element is visible
        const wrongElem = document.getElementsByClassName(classes.Wr).length > 0;
        const rightElem = document.getElementsByClassName(classes.yt).length > 0;
        return !wrongElem && rightElem;
    }

    function getSavedAnswer(question) {
        const found = savedAnswers.find(item => item.question === question);
        return found ? found.answer : null;
    }

    // --- Core Logic ---

    function handleTextInput() {
        let inputField = document.getElementsByClassName(classes.iH)[0];
        let submitBtn = document.getElementsByClassName(classes.Rw)[0];
        let questionText = document.getElementsByClassName(classes.wv)[0].innerText;
        
        let previousAnswer = getSavedAnswer(questionText);
        if (previousAnswer) {
            inputField.placeholder = previousAnswer;
        }

        const logState = () => {
            setTimeout(() => {
                if (isCorrectResponse()) saveAnswer(questionText, inputField.value);
            }, 250);
        };

        submitBtn.addEventListener("mouseup", logState);
        inputField.addEventListener("keyup", (e) => {
            if (e.keyCode === 13) logState();
        });
    }

    function handleMultipleChoice() {
        let options = document.getElementsByClassName(classes.YM);
        let questionText = document.getElementsByClassName(classes.wv)[0].innerText;
        let knownAnswer = getSavedAnswer(questionText);

        for (let i = 0; i < options.length; i++) {
            options[i].addEventListener("mouseup", () => {
                let chosenAnswer = options[i].innerText;
                setTimeout(() => {
                    if (isCorrectResponse()) saveAnswer(questionText, chosenAnswer);
                }, 250);
            });

            // Highlight the answer if we already know it
            if (options[i].innerText === knownAnswer) {
                options[i].style.transform = "scale(1.3)";
                options[i].style.transition = "transform 0.2s";
                options[i].style.zIndex = "1000";
            }
        }
    }

    // --- Main Loop ---

    function init() {
        if (window.location.href.split(".")[1] !== "gimkit") return;
        
        console.log("Gimkit Logger Active: Answer questions to build cache.");
        
        setInterval(() => {
            if (document.getElementsByClassName(classes["a$"]).length > 0) {
                if (isInputPresent()) {
                    handleTextInput();
                } else {
                    handleMultipleChoice();
                }
            }
        }, 1000); // Check every second
    }

    // Run the script
    init();
})();
