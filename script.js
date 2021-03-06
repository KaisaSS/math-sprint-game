// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

// Refresh Splash page scores
const bestScoresToDOM = () => {
  bestScores.forEach((bestScore, i) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[i].bestScore}s`;
  });
};

// Check Local Storage for best score and set bestScoreArray
const getSavedBestScores = () => {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
};

// Update bestScoreArray
const updateBestScore = () => {
  bestScoreArray.forEach((score, i) => {
    // Select correct bestScore to update
    if (questionAmount == score.questions) {
      // Return best score as one decimal number
      const savedBestScore = parseInt(bestScoreArray[i].bestScore);
      // Update if new score < old score || old score = 0
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[i].bestScore = finalTimeDisplay;
      }
    }
  });
  // Update Splash Page
  bestScoresToDOM();
  // Save to local storage
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
};

// Reset Game
const playAgain = () => {
  gamePage.addEventListener("click", startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
};

// Show Score Page
const showScorePage = () => {
  // Show 'play again' after 1s
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  scorePage.hidden = false;
  gamePage.hidden = true;
};

// Format and Display Time in DOM
const scoresToDOM = () => {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  // Scroll to top, go to Score page
  itemContainer.scrollTo({ top: 0, behavior: "instant" });

  showScorePage();
};

// Stop Timer, Process Results, and go to Score Page
const checkTime = () => {
  console.log(timePlayed);
  if (playerGuessArray.length == questionAmount) {
    console.log("player guess array:", playerGuessArray);
    clearInterval(timer);

    // Check for wrong guessed, add penalty
    equationsArray.forEach((equation, i) => {
      if (equation.evaluated === playerGuessArray[i]) {
        // Correct, no Penalty
      } else {
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    console.log("time:", timePlayed, "penalty:", penaltyTime, "final:", finalTime);
    scoresToDOM();
  }
};

// Add 10th of a second to timePlayed
const addTime = () => {
  timePlayed += 0.1;
  checkTime();
};

// Start timer when game page is clicked
const startTimer = () => {
  // Reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
};

// Scroll, Store User Selection in playerGuessArray
const select = (guessedTrue) => {
  // Scroll 80px
  valueY += 80;
  itemContainer.scroll(0, valueY);
  // Add guess to array
  return guessedTrue ? playerGuessArray.push("true") : playerGuessArray.push("false");
};

// Display Game Page
const showGamePage = () => {
  gamePage.hidden = false;
  countdownPage.hidden = true;
};

// Get Random Number up to max number
const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

// Create Correct/Incorrect Random Equations
const createEquations = () => {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  console.log("correct equations:", correctEquations);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  console.log("wrong equations:", wrongEquations);
  // Loop through for each correct equation, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(2);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
};

// Add Equations to DOM
const equationsToDOM = () => {
  equationsArray.forEach((equation) => {
    // Item
    const item = document.createElement("div");
    item.classList.add("item");
    // Equation Text
    const equationText = document.createElement("h1");
    equationText.textContent = equation.value;
    // Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
};

// Dynamically adding correct/incorrect equations
const populateGamePage = () => {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
};

// Display countdown
const countdownStart = () => {
  let count = 3;
  countdown.textContent = count;
  const timeCountDown = setInterval(() => {
    count--;
    if (count === 0) {
      countdown.textContent = "GO!";
    } else if (count === -1) {
      showGamePage();
      clearInterval(timeCountDown);
    } else {
      countdown.textContent = count;
    }
  }, 1000);
};

// Navigate from Splash page to Countdown page
const showCountdown = () => {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
};

// Get the value from selected radio button
const getRadioValue = () => {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
};

// Form that decides number of questions
const selectQuestionAmount = (e) => {
  e.preventDefault();
  questionAmount = getRadioValue();
  console.log("question amount:", questionAmount);
  if (questionAmount) {
    showCountdown();
  }
};

// Switch selected input styling
startForm.addEventListener("click", () => {
  radioContainers.forEach((radioEl) => {
    // Remove Selected Label Styling
    radioEl.classList.remove("selected-label");
    // Add it back if radio input is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add("selected-label");
    }
  });
});

// Event Listeners
startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);

// On Load
getSavedBestScores();
