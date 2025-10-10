// utils/generatePrompt.js
function extractionPrompt(text) {
  return `
      You are an expert in pedagogy and instructional design for primary and middle school education.
  
      You will be given a piece of text. If it clearly contains a valid school exercise (e.g., reading comprehension, math problem, grammar activity), analyze it and return **only** a JSON object with the following structure:
  
      {
      "text": "...",                         // the full original exercise text
      "prerequisites": [ "...", "..." ],     // list of pre-skills or prior knowledge needed to do the exercise (max 5 words for each)
      "learning_objectives": [ "...", "..." ], // what students are expected to learn, the step next to the prerequisites (max 5 words for each)
      "school_level": "elementary" | "middle",
      "grade": 1-5 (for elementary) or 1-3 (for middle school) //string
      }
  
      If the input text is not a valid school exercise (e.g., it's just random text, incomplete, unrelated to teaching, or nonsensical), return **only** this JSON object:
  
      {
      "error": "The provided text does not appear to be a valid school exercise."
      }
  
      Respond only with the JSON object, no commentary, no markdown formatting.
  
      Input:
      """${text}"""
      `;
}

function generatePrompt(formData, manual) {
  
  const {
    exercisetext,
    exercisefeatures,
    goals,
    prerequisites,
    school,
    grade,
    reminder,
    example,
    exercise_level,
    n_questions,
    vocabulary,
    style,
    selectedStyle,
    dislexiaInclusive,
    language,
  } = formData;

  const palette = style[selectedStyle]?.palette.filter(Boolean) || ["#000000"];
  const dislexia = dislexiaInclusive
    ? "Use font size between 18-24, increase spacing, and keep layout simple and accessible."
    : "";
  
  const formattedFeatures = exercisefeatures.join(", ") || "Not specified"
  const formattedGoals = goals.join(", ") || "Not specified";
  const formattedPre = prerequisites.join(", ") || "Not specified";

  const followStructure = exercisefeatures.includes("exercise structure")
  const followVocabulary = exercisefeatures.includes("exercise vocabulary")
  const followTypology = exercisefeatures.includes("exercise typology")

  return `
    You are an expert educational content creator for ${school} school, grade ${grade}.
    Create a ${exercise_level} level exercise based on the following features:

    Goals: ${formattedGoals}
    Prerequisites: ${formattedPre}
    ${!followVocabulary && `Vocabulary style: ${vocabulary}`}
    ${!followStructure && `Number of questions: ${n_questions}`}

    ${!manual && `Original text to take inspiration from:
      """${exercisetext || "N/A"}"""`
    }

    Reasoning Guide:
    - Carefully check the logical and/or mathematical correctness of every exercise and solution before finalizing the output. 
    - Always perform step-by-step reasoning or calculations internally before writing the final solution. 
    - If the exercise requires false statement, avoid contradictions. Do not state something is different if it is equal (es. 2!=2).
    - Explanations must always align with the final answer. Never state something is true if the reasoning shows it is false, and never state something is false if the reasoning shows it is true.

    Creation guide:
    ${!manual?
    `- You have to extract from the original text exlusively the following features: ${formattedFeatures}
    - Do not confuse exercise structure with exercise typology. The structure concern only how the exercise is composed (es. instruction, question points), the typology concern the type of exercise (es. open-ended questions, true/false with explanation, fill-in-the-blank).
    ${!followTypology && "- Ensure variety in the exercise types: open-ended questions, true/false with explanation, fill-in-the-blank, multiple choice with plausible distractors, practical application problems."}`
    :"- Ensure variety in the exercise types: open-ended questions, true/false with explanation, fill-in-the-blank, multiple choice with plausible distractors, practical application problems."}
    - Write the solutions in a clear, structured way (step-by-step when relevant), so they can be followed by a student without confusion.
    - Use the following color palette for text color selection: ${palette.join(", ")}.
    - The language of the output must be in ${language.label}
    ${dislexia}

    TextBox Structure guide:
    1. The first TextBox object must always be a title of the exercise.
    2. The second TextBox must always be a general test instruction of what the student has to do. ${reminder ? "- The third textbox must be a useful reminder or note to help students concerning the pre-prequisites." : ""}
    3. The following TextBoxes will all contain a different exercise ${!followStructure? `each one its own clear instruction, that specifies what to do in the exercise. There must be ${n_questions} exercises.`: "each one following the original text structure, remember to keep clear instructions for each exercise."}
    4. Each exercise ${followStructure? "follows the exercise structure of the original text":"has 3 points to solve"}. ${example ? "Include a worked-out example already solved as really first point (0) for each exercise created immediatly after the exercise instruction." : ""}. Use lists and newlines to make the exercises well readable and formatted.
    5. The solution will be displayed in another page, so the position for solution text boxes have to be resetted. Insert a solution title as first textbox of page 2.
    6. The followig TextBoxes has to contain the solutions relative to each exercise, one textbox for each exercise. Inside each textbox use newlines to format properly each part of the solution showing clearly all the procedures. 

    Return your result ONLY as a JSON array of objects, each object must have the following structure, no commentary, no markdown formatting:

    {
      "id": unique number (timestamp),
      "page": 1 (exercise) or 2 (solution), //1 belogs to the exercise, 2 belongs to the solution
      "content": "<text content>", 
      "position": { "x": <number>, "y": <number> }, // css position relative to the container, takes as a reference a container 794x1123 px, also consider 20 px of spacing between consequent textboxes and 40 px from margins
      "w": <width>, //takes as a reference a container 794x1123 px, mantain a padding of a A4 pdf format
      "h": <height>, // 26 for each new line (\\n) + 26
      "textSize": <font size between 12 and 24>, 
      "textColor": "<color from palette or #000000>",
      "bold": true|false,
      "italic": true|false,
      "underlined": true|false,
      "modelconfidence": null,
      "rationale": "",
    }
    `;
}

function regenerateElementPrompt(allTextBoxes, targetId, userInstruction) {

  return `
    You are a pedagogical assistant. You are working with a JSON-based editable layout system for educational exercises.

    Each block of the exercise is represented as a TextBox object with this structure:

    {
      "id": unique number (timestamp),
      "page": 1 (exercise) or 2 (solution),
      "position": { "x": <number>, "y": <number> }, 
      "w": <width>, 
      "h": <height>,
      "content": "<text content>", 
      "textSize": <font size between 12 and 24>,
      "textColor": "<color from other boxes palette or #000000>",
      "bold": true|false,
      "italic": true|false,
      "underlined": true|false,
      "modelconfidence": <integer 1-7>,
      "rationale": "<short reason why the modelconfidence was given>"
    }

    You will receive:
    1. The full current list of TextBox blocks
    2. The ID of the block to regenerate
    3. A user instruction describing what should be changed

    Your task:
    - Return ONLY a new version of that specific TextBox, using the same ID and other formatting properties (unless the instruction says to change them)
    - Update the "content" field according to the instruction
    - You can consider the context (surrounding TextBoxes) to improve clarity or coherence
    - Preserve the language used in the other boxes

    Here is the list of current TextBoxes:

    ${JSON.stringify(allTextBoxes, null, 2)}

    Block ID to regenerate: ${targetId}

    User instruction: "${userInstruction}"

    Respond with only the updated TextBox as JSON, no markdown or extra text.
    `;
}

function regenerateAllPrompt(allTextBoxes, userInstruction) {

  return `
    You are a pedagogical assistant. You are working with a JSON-based editable layout system for educational exercises.

    Each block of the exercise is represented as a TextBox object with this structure:

    {
      "id": unique number (timestamp),
      "page": 1 (exercise) or 2 (solution),
      "position": { "x": <number>, "y": <number> }, 
      "w": <width>, 
      "h": <height>,
      "content": "<text content>", 
      "textSize": <font size between 12 and 24>,
      "textColor": "<color from other boxes palette or #000000>",
      "bold": true|false,
      "italic": true|false,
      "underlined": true|false,
      "modelconfidence": <integer 1-7>,
      "rationale": "<short reason why the modelconfidence was given>"
    }

    You will receive:
    1. The full current list of TextBox blocks
    2. A user instruction describing what should be changed

    Your task:
    - Return the full updated JSON with the changes according to the instructions, mantaining the same ID and other formatting properties (unless the instruction says to change them)
    - You can change every other object field in order to accomplish the instruction
    - Maintain clarity and coherence with respect to the original one
    - Preserve the language used in the text boxes
    - Change the solution text boxes content in order to fit and be coherent with the exercise changes, if any.

    Here is the list of current TextBoxes:

    ${JSON.stringify(allTextBoxes, null, 2)}

    User instruction: "${userInstruction}"

    Respond with only the updated TextBox as JSON, no markdown or extra text.
    `;
}

function regenerateSolutionPrompt(allTextBoxes) {

  return `
    You are a pedagogical assistant. You are working with a JSON-based editable layout system for educational exercises.

    Each block of the exercise is represented as a TextBox object with this structure:

    {
      "id": unique number (timestamp),
      "page": 1 (exercise) or 2 (solution),
      "position": { "x": <number>, "y": <number> }, //referenced to container 794x1123 px, use standard margin for A4 pdf file
      "w": <width>, 
      "h": <height>,
      "content": "<text content>", 
      "textSize": <font size between 12 and 24>,
      "textColor": "<color from other boxes palette or #000000>",
      "bold": true|false,
      "italic": true|false,
      "underlined": true|false,
      "modelconfidence": <integer 1-7>,
      "rationale": "<short reason why the modelconfidence was given>"
    }

    You will receive the full current list of TextBox blocks

    Your task:
    - Correct the content field of the solution textBoxes (page=2) in relation to the corresponding exercise textBoxes (page = 1), if any, mantaining the same ID and other formatting properties.
    - Always perform step-by-step reasoning or calculations internally before writing the final solution. Be aware to possible contradictions.
    - If a part of the solution is missing in relation to the exercise, create a new object with the solution mantaing the formatting of other solution text boxes and a new timestamp ID.
    - Correct, if needed, the position field of the solutions textBoxes in order to match the order of the exercises and to be placed at the start of the solution page.
    - Maintain clarity and coherence with the solution correction. 
    - Preserve the language used in the text boxes

    Here is the list of current TextBoxes:

    ${JSON.stringify(allTextBoxes, null, 2)}

    Respond with only the JSON array of updated TextBoxes and/or created ones, if there are not return only JSON empty array, no markdown or extra formatting.
    `;
}

function evaluateConfidencePrompt(allTextBoxes) {

return `
  You are a pedagogical assistant. You are working with a JSON-based editable layout system for educational exercises.
  Each block of the exercise is represented as a TextBox object with this structure:

  {
    "id": unique number (timestamp),
    "page": 1 (exercise) or 2 (solution),
    "position": { "x": <number>, "y": <number> }, //referenced to container 794x1123 px, use standard margin for A4 pdf file
    "w": <width>, 
    "h": <height>,
    "content": "<text content>", 
    "textSize": <font size between 12 and 24>,
    "textColor": "<color from other boxes palette or #000000>",
    "bold": true|false,
    "italic": true|false,
    "underlined": true|false,
    "modelconfidence": <integer 1-7>,
    "rationale": "<short reason why the modelconfidence was given>"
  }

  You will receive the full current list of TextBox blocks.

  Your task:
  - Carefully check the logical and/or mathematical correctness and coherence of the content field for each textbox.
  - If the exercise contains proportions, ALWAYS compute the cross-products explicitly:
      a : b = c : d  →  check if a·d equals b·c
  - If the proportion contains x, explicitly compute the equation and give the value of x in the rationale (e.g., "4x=60 ⇒ x=15").
  - For non-mathematical text (titles, instructions, descriptions), put 1 only if the exercise contains logical or vocabulary errors, with a short rationale, 7 otherwise.
  - Perform all step-by-step reasoning internally. 
  - Correct only the modelconfidence and rationale fields:
      - Put modelconfidence=1 if you find contradictions, mistakes, or incoherence. 
      - Put modelconfidence=7 if everything is correct.
      - The rationale have to generally evidence the wrong points of the exercise or solution without explaining why (e.g. "The points a) and b) of this solution seem to be incorrect", "The instruction of this exercise seem to be incorrect")
  - If a textbox in the exercise has modelconfidence=1, assign modelconfidence=1 to the corresponding solution textbox as well, or viceversa. Putting as rationale "Check the corresponding solution" or "Check the corresponding exercise"
  - Do not modify or correct the content of wrong textboxes.

  Here is the list of current TextBoxes:

  ${JSON.stringify(allTextBoxes, null, 2)}

  Respond with ONLY the JSON array of TextBoxes, no markdown, no explanation, no extra formatting.
`;
}


function generateImagePrompt(instruction, palette){
  const formattedPalette = palette.filter(Boolean).join(", ");
  return `
  Create an educational illustration suitable for a primary or middle school exercise sheet.

  Instructional theme: ${instruction}.

  Design style: clean and simple, with visual clarity, friendly shapes, and no clutter.

  Use the following color palette as visual reference:
  Primary colors: ${formattedPalette}.

  Avoid photo-realism. Make the illustration child-friendly and visually coherent with the specified colors.
  Do not include text in the image. The layout should leave space around the subject so it can be embedded in an exercise layout.`;
}

function cleanJSON(rawText){
  return rawText
    .replace(/^```json\s*/i, '')  // rimuove ```json all'inizio
    .replace(/^```/, '')          // rimuove ``` semplice
    .replace(/```$/, '')          // rimuove ``` finale
    .trim();
};

function formattaData(timestamp) {
  return new Date(timestamp).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatDuration(diffMs) {
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} min ${seconds} sec`;
}

function calcDuration(keys, data) {
  const durate = {};
  for (let i = 0; i < keys.length - 1; i++) {
    const fase = keys[i];
    const faseSuccessiva = keys[i + 1];
    const diffMs = data[faseSuccessiva] - data[fase];
    durate[`${fase} -> ${faseSuccessiva}`] = formatDuration(diffMs);
  }
  return durate;
}

function createLog(keys, data, filename, school, grade, level) {
  let log = '=== LOG ESPORTAZIONE ===\n';
  log += `File used:${filename}\n`;
  log += `Exercise: ${level} exercise for ${school} school ${grade} grade\n`;

  // Timestamp assoluti
  log += '\n--- TIMESTAMP ---\n';
  for (const key of keys) {
    log += `${key}: ${formattaData(data[key])} (${data[key]})\n`;
  }

  // Durate parziali
  log += '\n--- TEMPI PARZIALI (min) ---\n';
  const durate = calcDuration(keys, data);
  for (const [fase, diff] of Object.entries(durate)) {
    log += `${fase}: ${diff}\n`;
  }

  const totaleMs = data[keys[keys.length - 1]] - data[keys[0]];
  log += '\n--- TEMPO TOTALE (min) ---\n';
  log += `${formatDuration(totaleMs)}\n`;

  return log;
}

export {createLog, evaluateConfidencePrompt, extractionPrompt, generatePrompt, generateImagePrompt, regenerateElementPrompt, regenerateAllPrompt, regenerateSolutionPrompt, cleanJSON}