const characterLayer = document.getElementById("characterLayer");
const milkLayer = document.getElementById("milkLayer");
const codeInput = document.getElementById("flexCode");
const lineNumbers = document.getElementById("lineNumbers");
const levelTitle = document.getElementById("levelTitle");
const instructions = document.getElementById("instructions");
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("nextLevel");

/*
  Each level tells JavaScript where to place the milk.
  I built levels 1 and 2. Replace each null below with a level object.

  Example:
  {
    justifyContent: "space-between",
    alignItems: "center",
    instruction: "Tell the player where the cats need to go."
  }
*/
const levels = [
  // Level 1: the player only needs justify-content: center;
  {
    justifyContent: "center",
    alignItems: "flex-start",
    instruction: "Move all the cats to the center at the top. Use justify-content.",
  },

  // Level 2: the player needs both commands.
  {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    instruction: "Move all the cats to the bottom-right corner. Use justify-content and align-items.",
  },

  null, // TODO: Build level 3.
  null, // TODO: Build level 4.
  null, // TODO: Build level 5.
  null, // TODO: Build level 6.
];

let currentLevel = 0;

/* Read the CSS that the player writes in the textarea. */
function readPlayerCode() {
  // Each new line is one CSS declaration.
  // A semicolon at the end of a line is optional.
  const lines = codeInput.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const css = document.createElement("div").style;

  for (const line of lines) {
    const declaration = line.endsWith(";") ? line : line + ";";
    const lineStyle = document.createElement("div").style;
    lineStyle.cssText = declaration;

    // The browser could not understand this line.
    if (lineStyle.length !== 1) {
      return null;
    }

    css.cssText += declaration;
  }

  return {
    justifyContent: css.justifyContent,
    alignItems: css.alignItems,
  };
}

/* Show 1, 2, 3... next to the lines in the textarea. */
function updateLineNumbers() {
  const numberOfLines = codeInput.value.split("\n").length;
  let numbers = "";

  for (let line = 1; line <= numberOfLines; line += 1) {
    numbers += line + "\n";
  }

  lineNumbers.textContent = numbers;
}

/*
  Check the real positions on the page.
  This means any CSS answer is correct if the cats cover the milk.
*/
function catsAreOnMilk() {
  const cats = characterLayer.children;
  const milk = milkLayer.children;

  for (let index = 0; index < cats.length; index += 1) {
    const catBox = cats[index].getBoundingClientRect();
    const milkBox = milk[index].getBoundingClientRect();

    if (
      Math.abs(catBox.left - milkBox.left) > 1 ||
      Math.abs(catBox.top - milkBox.top) > 1
    ) {
      return false;
    }
  }

  return true;
}

/* Move the cats whenever the player types. */
function checkAnswer() {
  const answer = readPlayerCode();

  // If one line is invalid, reset the cats to the starting position.
  if (answer === null) {
    characterLayer.style.justifyContent = "flex-start";
    characterLayer.style.alignItems = "flex-start";
    nextButton.disabled = true;
    feedback.textContent = "One of the CSS lines is not valid.";
    updateLineNumbers();
    return;
  }

  characterLayer.style.justifyContent = "";
  characterLayer.style.alignItems = "";

  characterLayer.style.justifyContent = answer.justifyContent || "flex-start";

  characterLayer.style.alignItems = answer.alignItems || "flex-start";

  updateLineNumbers();

  // Enable the button only when every cat is on its milk target.
  const isCorrect = catsAreOnMilk();
  nextButton.disabled = !isCorrect;

  feedback.textContent = isCorrect
    ? "Correct! You can go to the next level."
    : "Keep trying.";
}

/* Change the text and milk position for the current level. */
function loadLevel() {
  const level = levels[currentLevel];

  levelTitle.textContent =
    "Flexbox Cats - Level " + (currentLevel + 1) + " of " + levels.length;

  // A null level is waiting for you to build it.
  if (level === null) {
    milkLayer.style.justifyContent = "flex-start";
    milkLayer.style.alignItems = "flex-start";
    characterLayer.style.justifyContent = "flex-start";
    characterLayer.style.alignItems = "flex-start";
    codeInput.value = "";
    codeInput.disabled = true;
    nextButton.disabled = true;
    instructions.textContent =
      "Build this level in the levels array inside myjs.js.";
    feedback.textContent =
      "This level is ready for you to build in the levels array.";
    updateLineNumbers();
    return;
  }

  // These two lines move the milk by changing CSS on the HTML element.
  milkLayer.style.justifyContent = level.justifyContent;
  milkLayer.style.alignItems = level.alignItems;
  instructions.textContent = level.instruction;

  // Every level starts the cats in the top-left corner.
  characterLayer.style.justifyContent = "flex-start";
  characterLayer.style.alignItems = "flex-start";

  codeInput.disabled = false;
  codeInput.value = "";
  nextButton.disabled = true;
  nextButton.textContent = "Next level";
  feedback.textContent = "Move the cats onto the milk.";
  updateLineNumbers();
}

codeInput.addEventListener("input", checkAnswer);

nextButton.addEventListener("click", () => {
  if (currentLevel === levels.length - 1) {
    feedback.textContent = "You completed all 6 levels!";
    nextButton.disabled = true;
    return;
  }

  currentLevel += 1;
  loadLevel();
});

loadLevel();
