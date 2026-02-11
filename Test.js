// ==UserScript==
// @name         Blooket Auto-Answer Elite
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Automatically fetches and clicks the correct answers in Blooket
// @author       Gemini
// @match        *://*.blooket.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let gameData = null;

    // 1. INTERCEPT THE ANSWERS
    // This listens to the network traffic and steals the answer key when the game starts.
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if (this.responseURL.includes("api/games?gameId=")) {
                try {
                    gameData = JSON.parse(this.responseText);
                    console.log("✅ Answer Key Captured!");
                } catch (e) {
                    console.error("❌ Failed to parse game data.");
                }
            }
        });
        originalOpen.apply(this, arguments);
    };

    // 2. THE SEARCH FUNCTION
    // Searches the captured data for the correct answer string.
    function findCorrectAnswer(questionText) {
        if (!gameData || !gameData.questions) return null;
        const questionObj = gameData.questions.find(q => q.question === questionText);
        return questionObj ? questionObj.correctAnswers[0] : null;
    }

    // 3. THE AUTO-CLICKER
    // Runs every 300ms to see if a question is on screen.
    setInterval(() => {
        // Look for the question text element
        const questionElement = document.querySelector('[class*="questionText"] div');
        
        if (questionElement) {
            const currentQuestion = questionElement.innerText;
            const correctAnswer = findCorrectAnswer(currentQuestion);

            if (correctAnswer) {
                // Find all answer buttons
                const answerButtons = document.querySelectorAll('[class*="answerContainer"], [class*="answersHolder"] > div');
                
                answerButtons.forEach(button => {
                    // If the button text matches the correct answer, click it!
                    if (button.innerText === correctAnswer) {
                        // We target the inner click area to ensure the game registers the click
                        const clickTarget = button.querySelector('div') || button;
                        clickTarget.click();
                    }
                });
            }
        }

        // AUTO-CLICK "NEXT" OR "OK" BUTTONS
        // This clears the feedback screens so you move to the next question instantly.
        const feedbackButton = document.querySelector('.fa-check') || 
                               document.querySelector('[class*="feedback"] button') ||
                               document.querySelector('[class*="modal"] button');
        if (feedbackButton) feedbackButton.click();

    }, 300);

})();
