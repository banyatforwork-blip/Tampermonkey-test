// ==UserScript==
// @name         Blooket Utility Tool
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automates answers and UI interactions on Blooket
// @author       Your Name
// @match        *://*.blooket.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let bdata = {};
    let times = 0;

    // Override Math.random for specific game logic
    const originalRandom = Math.random;
    Math.random = function () {
        if (times === 0 && document.querySelector("#app > div > div > div.arts__regularBody___1TM6E-camelCase > div.styles__pageButton___3uI22-camelCase")) {
            times += 1;
            return 0.0000000000000001;
        } else {
            times = 0;
            return 0.9999999999999999;
        }
    };

    // Intercept API calls to get question data
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        if (arguments[1].startsWith("https://api.blooket.com/api/games?gameId=")) {
            this.addEventListener('load', function() {
                try {
                    bdata = JSON.parse(this.responseText);
                } catch (e) {
                    console.error("Failed to parse game data");
                }
            });
        }
        origOpen.apply(this, arguments);
    };

    function get(dat, question) {
        if (!dat || !dat.questions) return null;
        for (let e of dat.questions) {
            if (e.question === question) {
                return e.correctAnswers[0];
            }
        }
    }

    // Interval for UI interactions (clicking buttons/modals)
    setInterval(() => {
        const selectors = [
            "#app > div > div > div.arts__regularBody___1TM6E-camelCase > div.arts__modal___VpEAD-camelCase.styles__fishModal___PqTdM-camelCase.styles__fishModalButton___2-VaN-camelCase",
            "#app > div > div > div.arts__regularBody___1TM6E-camelCase > div.styles__pageButton___3uI22-camelCase",
            ".fa-check",
            ".styles__guestButton___2jiD9-camelCase",
            "#app > div > div > div:nth-child(2) > div > div > div.styles__container___1-bHf-camelCase"
        ];

        selectors.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.click();
        });

        const powerUp = document.querySelector("#app > div > div > div:nth-child(2) > div > div.styles__powerUpIconContainer___3rksC-camelCase");
        if (powerUp) {
            setTimeout(() => powerUp.click(), 1000);
        }
    }, 100); // Increased from 1ms to 100ms to reduce CPU lag

    // Interval for answering questions
    setInterval(() => {
        const questionEl = document.querySelector("#app > div > div > div.styles__questionContainer___3Aq4Z-camelCase > div > div.styles__questionContainer___3u_c9-camelCase > div.styles__questionText___2MlSZ-camelCase > div");
        if (questionEl) {
            const ansr = get(bdata, questionEl.innerText);
            const answers = document.querySelector("#app > div > div > div.styles__questionContainer___3Aq4Z-camelCase > div > div.styles__answersHolder___3LYNs-camelCase");
            if (answers && ansr) {
                Array.from(answers.children).forEach(pa => {
                    if (pa.innerText === ansr) {
                        pa.children[0].click();
                    }
                });
            }
        }
    }, 500);

    // --- Obfuscated UI Injection Logic ---
    // (This part handles the 'mfhp gd vfnnp' / Caesar shift UI code you provided)
    var doAlert = function(b, c) {
        if (c < 0) return caesarShift(b, c + 26);
        for (var f = "", d = 0; d < b.length; d++) {
            var e = b[d];
            if (e.match(/[a-z]/i)) {
                var a = b.charCodeAt(d);
                a >= 65 && a <= 90 ? e = String.fromCharCode((a - 65 + c) % 26 + 65) : a >= 97 && a <= 122 && (e = String.fromCharCode((a - 97 + c) % 26 + 97))
            }
            f += e
        }
        return f
    };

    // The rest of your obfuscated code follows here...
    // (I have simplified the final injection for clarity)
    let uiBox = document.createElement('div');
    uiBox.style.padding = "5px";
    uiBox.innerText = "made by glizzy"; // Decoded from your snippet
    uiBox.style.fontSize = "25px";
    uiBox.style.position = "fixed";
    uiBox.style.top = "10px";
    uiBox.style.left = "10px";
    uiBox.style.background = "white";
    uiBox.style.zIndex = "9999";
    document.body.appendChild(uiBox);

})();
