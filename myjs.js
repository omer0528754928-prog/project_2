const characterLayer = document.getElementById("characterLayer");
const milkLayer = document.getElementById("milkLayer");
const codeInput = document.getElementById("flexCode");
const lineNumbers = document.getElementById("lineNumbers");
const levelTitle = document.getElementById("levelTitle");
const instructions = document.getElementById("instructions");
const feedback = document.getElementById("feedback");
const attemptCount = document.getElementById("attemptCount");
const nextButton = document.getElementById("nextLevel");
const resetButton = document.getElementById("resetLevel");
const hintButton = document.getElementById("hintButton");
const solutionButton = document.getElementById("solutionButton");
const hintText = document.getElementById("hintText");
const levelNavigation = document.getElementById("levelNavigation");

/*
  Each level tells JavaScript where to place the milk.
  Levels 1 and 2 are preserved; levels 3–6 add new Flexbox challenges.

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
    instruction:
      "Move all the cats to the center at the top. Use justify-content.",
  },

  // Level 2: the player needs both commands.
  {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    instruction:
      "Move all the cats to the bottom-right corner. Use justify-content and align-items.",
  },

  {
    startDisplay: "block",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    instruction:
      "Flexbox is turned off! Use display: flex, flex-direction: column, justify-content, and align-items to center a vertical stack of cats.",
  },
  {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    instruction:
      "Match cats 1–3 to their numbered milk: reverse the row, spread the cats from edge to edge, and center them vertically. Use flex-direction, justify-content, and align-items.",
  },
  {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "flex-end",
    instruction:
      "Make a column along the right edge, with equal space around each cat. Use flex-direction, justify-content, and align-items. Remember: in a column, the main axis runs vertically!",
  },
  {
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    instruction:
      "These cats have wider spaces! Use flex-wrap: wrap to fit them on two rows, then use justify-content and align-items to center them inside each row. Keep the default row direction.",
  },
];

let currentLevel = 0;
const levelDrafts = levels.map(() => "");
const levelAttempts = levels.map(() => 0);
const completedLevels = new Set();

function renderAttemptCount() {
  const attempts = levelAttempts[currentLevel];
  attemptCount.textContent = attempts > 0 ? "Attempts: " + attempts : "";
}

/* Mark the current level in the nav, and turn completed levels green. */
function updateLevelButtons() {
  Array.from(levelNavigation.children).forEach((button, index) => {
    if (index === currentLevel) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
    button.classList.toggle("level-complete", completedLevels.has(index));
  });
}

/* All levels are available, and switching keeps the code written so far. */
function goToLevel(index) {
  if (index < 0 || index >= levels.length || index === currentLevel) return;
  levelDrafts[currentLevel] = codeInput.value;
  currentLevel = index;
  loadLevel();
}

levels.forEach((level, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Level " + (index + 1);
  button.addEventListener("click", () => goToLevel(index));
  levelNavigation.appendChild(button);
});

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
    display: css.display,
    flexDirection: css.flexDirection,
    flexWrap: css.flexWrap,
    justifyContent: css.justifyContent,
    alignItems: css.alignItems,
  };
}

/* Reset every supported property so answers never leak into another level. */
function applyLayout(layer, layout = {}) {
  layer.style.display = layout.display || "flex";
  layer.style.flexDirection = layout.flexDirection || "row";
  layer.style.flexWrap = layout.flexWrap || "nowrap";
  layer.style.justifyContent = layout.justifyContent || "flex-start";
  layer.style.alignItems = layout.alignItems || "flex-start";
}

/* Flexbox properties a level's solution touches, in CSS declaration order. */
function levelDeclarations(level) {
  const declarations = [];
  if (level.startDisplay) declarations.push(["display", "flex"]);
  if (level.flexDirection) declarations.push(["flex-direction", level.flexDirection]);
  if (level.flexWrap) declarations.push(["flex-wrap", level.flexWrap]);
  if (level.justifyContent) declarations.push(["justify-content", level.justifyContent]);
  if (level.alignItems) declarations.push(["align-items", level.alignItems]);
  return declarations;
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
    applyLayout(characterLayer, { display: levels[currentLevel].startDisplay });
    nextButton.disabled = true;
    feedback.textContent = "One of the CSS lines is not valid.";
    feedback.classList.remove("feedback-success");
    feedback.classList.add("feedback-error");
    updateLineNumbers();
    return;
  }

  applyLayout(characterLayer, {
    ...answer,
    display: answer.display || levels[currentLevel].startDisplay,
  });

  updateLineNumbers();

  // Enable the button only when every cat is on its milk target.
  const isCorrect = characterLayer.style.display === "flex" && catsAreOnMilk();
  nextButton.disabled = !isCorrect;
  if (isCorrect) {
    completedLevels.add(currentLevel);
    updateLevelButtons();
  }

  feedback.textContent = isCorrect
    ? currentLevel === levels.length - 1
      ? "Correct! Click Finish to complete the game."
      : "Correct! You can go to the next level."
    : "Keep trying.";
  feedback.classList.toggle("feedback-success", isCorrect);
  feedback.classList.toggle("feedback-error", !isCorrect);
}

/* Count an attempt once the player pauses on a wrong or invalid answer. */
function recordAttempt() {
  if (codeInput.disabled || !codeInput.value.trim()) return;
  const answer = readPlayerCode();
  const isCorrect =
    answer !== null &&
    characterLayer.style.display === "flex" &&
    catsAreOnMilk();
  if (!isCorrect) {
    levelAttempts[currentLevel] += 1;
    renderAttemptCount();
  }
}

/* Change the text and milk position for the current level. */
function loadLevel() {
  const level = levels[currentLevel];

  levelTitle.textContent =
    "Flexbox Cats - Level " + (currentLevel + 1) + " of " + levels.length;
  updateLevelButtons();

  // Wide items guarantee wrapping on level 6 at any board width.
  for (const layer of [characterLayer, milkLayer]) {
    layer.classList.toggle("wrapping-level", level.flexWrap === "wrap");
    layer.classList.toggle("numbered-level", currentLevel === 3);
    Array.from(layer.children).forEach((item, index) => {
      item.dataset.number = index + 1;
    });
  }
  applyLayout(milkLayer, level);
  instructions.textContent = level.instruction;

  applyLayout(characterLayer, { display: level.startDisplay });

  codeInput.disabled = false;
  codeInput.value = levelDrafts[currentLevel];
  nextButton.disabled = true;
  nextButton.textContent =
    currentLevel === levels.length - 1 ? "Finish" : "Next level";
  feedback.textContent = "Move the cats onto the milk.";
  feedback.classList.remove("feedback-success", "feedback-error");
  hintText.textContent = "";
  renderAttemptCount();
  updateLineNumbers();
  if (codeInput.value.trim()) checkAnswer();
}

/* Put the current level back to its starting point. */
function resetLevel() {
  levelDrafts[currentLevel] = "";
  levelAttempts[currentLevel] = 0;
  completedLevels.delete(currentLevel);
  updateLevelButtons();
  codeInput.value = "";
  applyLayout(characterLayer, { display: levels[currentLevel].startDisplay });
  nextButton.disabled = true;
  feedback.textContent = "Level reset. Move the cats onto the milk.";
  feedback.classList.remove("feedback-success", "feedback-error");
  hintText.textContent = "";
  renderAttemptCount();
  updateLineNumbers();
  codeInput.focus();
}

codeInput.addEventListener("input", checkAnswer);
codeInput.addEventListener("blur", recordAttempt);
resetButton.addEventListener("click", resetLevel);

/* Hint: which properties are needed, without giving away the values. */
hintButton.addEventListener("click", () => {
  const properties = levelDeclarations(levels[currentLevel]).map(
    ([name]) => `  ${name}: ...;`
  );
  hintText.textContent = "/* Hint */\n" + properties.join("\n");
});

/* Show Solution: the exact CSS that solves the level, for players who are stuck. */
solutionButton.addEventListener("click", () => {
  const declarations = levelDeclarations(levels[currentLevel]).map(
    ([name, value]) => `  ${name}: ${value};`
  );
  hintText.textContent = "/* Solution */\n" + declarations.join("\n");
});

nextButton.addEventListener("click", () => {
  if (currentLevel === levels.length - 1) {
    feedback.textContent =
      completedLevels.size === levels.length
        ? "You completed all 6 levels!"
        : "Level 6 complete! Use the level buttons to finish the remaining levels.";
    codeInput.disabled = true;
    nextButton.disabled = true;
    return;
  }

  goToLevel(currentLevel + 1);
});

loadLevel();
