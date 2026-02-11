// ==UserScript==
// @name         Blooket Gold Quest - Auto-Answer & Chests
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Automatically answers correctly and opens chests in Gold Quest mode.
// @author       Gemini / qaiik
// @match        *://*.blooket.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let gameData = {};

    // --- 1. DATA CAPTURE (The blkt-reader core) ---
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        if (arguments[1].includes("api/games?gameId=")) {
            this.addEventListener('load', function() {
                try {
                    gameData = JSON.parse(this.responseText);
                    console.log("✔️ Game data loaded successfully.");
                } catch (e) {
                    console.error("❌ Error parsing game data.");
                }
            });
        }
        originalOpen.apply(this, arguments);
    };

    // Helper to find correct answer
    function getAnswer(question) {
        if (!gameData.questions) return null;
        const q = gameData.questions.find(e => e.question === question);
        return q ? q.correctAnswers[0] : null;
    }

    // --- 2. AUTOMATION LOOP ---
    setInterval(() => {
        // A. Handle Questions
        const questionText = document.querySelector('[class*="questionText"] div');
        if (questionText) {
            const answer = getAnswer(questionText.innerText);
            if (answer) {
                const buttons = document.querySelectorAll('[class*="answersHolder"] [class*="answerContainer"]');
                buttons.forEach(btn => {
                    if (btn.innerText === answer) {
                        btn.click();
                    }
                });
            }
        }

        // B. Handle Feedback (The "Correct" checkmark screen)
        const checkmark = document.querySelector(".fa-check") || document.querySelector('[class*="feedback"]');
        if (checkmark) {
            checkmark.click();
        }

        // C. Gold Quest: Open Chests
        // This looks for the chest containers specific to Gold Quest
        const chests = document.querySelectorAll('[class*="styles__container___"], [class*="styles__chest___"]');
        if (chests.length > 0) {
            // Click the first chest available (Gold Quest doesn't let you see inside them without ESP)
            chests[0].click();
        }

        // D. Skip "No Gold" or "OK" Modals
        const modalBtn = document.querySelector('[class*="modal"] button') || document.querySelector('[class*="styles__pageButton"]');
        if (modalBtn) {
            modalBtn.click();
        }

    }, 250); // Checks every 250ms

    // --- 3. UI TWEAK (Optional) ---
    // Injects a small indicator so you know the script is active.
    const indicator = document.createElement('div');
    indicator.innerHTML = '👑 GOLD QUEST ACTIVE';
    indicator.style = "position:fixed;bottom:10px;right:10px;background:gold;color:black;padding:5px 10px;font-weight:bold;border-radius:5px;z-index:9999;font-family:sans-serif;font-size:12px;pointer-events:none;";
    document.body.appendChild(indicator);

})();
