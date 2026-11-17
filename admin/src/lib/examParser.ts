import { Id } from "@convex/_generated/dataModel";
import { ParsedQuestionItem } from "@/components/questions/SmartDocumentImporter";

export interface ParseExamOptions {
  subjectId: Id<"subjects">;
  defaultDifficulty?: "easy" | "medium" | "hard";
}

/**
 * Extracts the Answer Key section if present at the end of the document.
 * Returns a map of question number -> { answer, explanation } and the cleaned question text.
 */
function extractAnswerKeySection(text: string): {
  keyMap: Map<number, { answer: string; explanation?: string }>;
  questionsText: string;
} {
  const keyMap = new Map<number, { answer: string; explanation?: string }>();

  // Look for "ANSWER KEY", "KEY TO CORRECTION", "SOLUTIONS", "ANSWERS" headers
  const keyHeaderRegex =
    /(?:\n|^)\s*(?:[-=*#_\s]*)\s*(?:answer\s*keys?|keys?\s*to\s*correction|solutions?|answers?)\s*(?:[-=*#_\s]*)(?::)?\s*(?:\n|$)/i;

  const match = text.match(keyHeaderRegex);
  if (!match || match.index === undefined) {
    return { keyMap, questionsText: text };
  }

  const questionsText = text.slice(0, match.index).trim();
  const keySectionText = text.slice(match.index + match[0].length).trim();

  // Parse lines or tokens in keySectionText
  // Matches: "1. B", "1) B", "1: B", "1 - B", "1. B - Explanation..."
  // Also matches multi-column: "1. A  2. B  3. C"
  const entryRegex =
    /(?:^|\s)(?:q(?:uestion)?\.?\s*)?(\d+)\s*[:.\-)\s]\s*([a-eA-E]|\b[^\n\r,;]+)/g;

  // First try matching letter answers (most common in mock exams)
  const letterRegex =
    /(?:^|\s)(?:q(?:uestion)?\.?\s*)?(\d+)\s*[:.\-)\s]\s*([a-eA-E])\b(?:\s*[-:]\s*([^\n\r;]+))?/gi;

  let letterMatch;
  while ((letterMatch = letterRegex.exec(keySectionText)) !== null) {
    const qNum = parseInt(letterMatch[1], 10);
    const ansLetter = letterMatch[2].toLowerCase();
    const explanation = letterMatch[3]?.trim();
    if (!isNaN(qNum)) {
      keyMap.set(qNum, { answer: ansLetter, explanation });
    }
  }

  // If no letter matches were found, try matching identification answers line-by-line
  if (keyMap.size === 0) {
    const lines = keySectionText.split("\n");
    for (const line of lines) {
      const lineMatch = line.trim().match(/^(?:q(?:uestion)?\.?\s*)?(\d+)\s*[:.\-)\s]\s*(.+)$/i);
      if (lineMatch) {
        const qNum = parseInt(lineMatch[1], 10);
        const ans = lineMatch[2].trim();
        if (!isNaN(qNum) && ans) {
          keyMap.set(qNum, { answer: ans });
        }
      }
    }
  }

  return { keyMap, questionsText };
}

/**
 * Parses raw mock exam text (questions with choices and answer keys)
 * into structured ParsedQuestionItem objects.
 */
export function parseMockExamText(
  rawText: string,
  options: ParseExamOptions
): ParsedQuestionItem[] {
  if (!rawText || !rawText.trim()) return [];

  const { subjectId, defaultDifficulty = "medium" } = options;

  // 1. Extract Answer Key section from bottom of text if available
  const { keyMap, questionsText } = extractAnswerKeySection(rawText);

  // 2. Identify question boundaries
  // Matches question starts like "1. ", "1) ", "Question 1: ", "1 - "
  const questionStartRegex =
    /(?:^|\n)\s*(?:(?:Question|Item|Q)\s*)?(\d+)\s*[:.\-)]\s+/gi;

  const matches: { index: number; length: number; qNum: number }[] = [];
  let m;

  while ((m = questionStartRegex.exec(questionsText)) !== null) {
    const qNum = parseInt(m[1], 10);
    matches.push({
      index: m.index,
      length: m[0].length,
      qNum,
    });
  }

  // If no numbered questions found, fallback to blank or split by double newlines
  if (matches.length === 0) {
    return [];
  }

  const results: ParsedQuestionItem[] = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index + current.length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : questionsText.length;

    const blockText = questionsText.slice(startIndex, endIndex).trim();
    if (!blockText) continue;

    // Check for inline Answer / Explanation in the block:
    // e.g. "Answer: B", "Ans: C", "Correct: A"
    let inlineAnswer: string | undefined = undefined;
    let inlineExplanation: string | undefined = undefined;

    const ansMatch = blockText.match(
      /(?:\n|^)\s*(?:correct\s+)?ans(?:wer)?[:\s\-]+([a-eA-E]|\b[^\n\r]+)/i
    );
    if (ansMatch) {
      inlineAnswer = ansMatch[1].trim();
    }

    const explMatch = blockText.match(
      /(?:\n|^)\s*(?:explanation|rationale|note)[:\s\-]+([^\n\r]+(?:\n(?![a-eA-E][.\-)]).*)*)/i
    );
    if (explMatch) {
      inlineExplanation = explMatch[1].trim();
    }

    // Strip the answer and explanation lines from choices search
    let bodyForChoices = blockText;
    if (ansMatch && ansMatch.index !== undefined) {
      bodyForChoices = bodyForChoices.slice(0, ansMatch.index).trim();
    }

    // Parse choices: A. ... B. ... C. ... D. ...
    // Matches choice markers: A. / A) / (A) / [A] / a. / a) / (a)
    const choiceMarkerRegex =
      /(?:^|\n|\s{2,}|\t)(?:\(?([a-eA-E])[\.)\]]|\[([a-eA-E])\])\s+/g;

    const choiceMatches: { index: number; length: number; letter: string }[] = [];
    let cm;

    while ((cm = choiceMarkerRegex.exec(bodyForChoices)) !== null) {
      const letter = (cm[1] || cm[2]).toLowerCase();
      choiceMatches.push({
        index: cm.index,
        length: cm[0].length,
        letter,
      });
    }

    // Determine question text & choices
    let questionPrompt = "";
    const choices: { id: string; text: string }[] = [];

    if (choiceMatches.length >= 2) {
      // Multiple choice question
      questionPrompt = bodyForChoices.slice(0, choiceMatches[0].index).trim();

      for (let c = 0; c < choiceMatches.length; c++) {
        const cCurrent = choiceMatches[c];
        const cStart = cCurrent.index + cCurrent.length;
        const cEnd =
          c + 1 < choiceMatches.length
            ? choiceMatches[c + 1].index
            : bodyForChoices.length;

        const choiceText = bodyForChoices.slice(cStart, cEnd).trim();
        choices.push({
          id: cCurrent.letter,
          text: choiceText,
        });
      }
    } else {
      // Identification or short answer
      questionPrompt = bodyForChoices.trim();
    }

    // Clean question prompt from common extraneous prefixes/newlines
    questionPrompt = questionPrompt.replace(/^\s*[-=*_]+\s*/, "").trim();

    // Determine correct answer
    // Priority:
    // 1. Inline answer if present
    // 2. Answer key map from document bottom
    // 3. Fallback to choice 'a' if multiple choice
    let finalCorrectChoiceId: string | undefined = undefined;
    let acceptedAnswers: string[] | undefined = undefined;
    const keyEntry = keyMap.get(current.qNum);

    const resolvedAnswerString = inlineAnswer || keyEntry?.answer;

    if (choices.length > 0) {
      if (resolvedAnswerString && /^[a-eA-E]$/i.test(resolvedAnswerString.trim())) {
        finalCorrectChoiceId = resolvedAnswerString.trim().toLowerCase();
      } else if (resolvedAnswerString) {
        // Maybe the answer string matches the text of one of the choices!
        const matchingChoice = choices.find(
          (c) => c.text.toLowerCase() === resolvedAnswerString.toLowerCase().trim()
        );
        finalCorrectChoiceId = matchingChoice ? matchingChoice.id : "a";
      } else {
        finalCorrectChoiceId = "a";
      }
    } else {
      // Identification question
      if (resolvedAnswerString) {
        acceptedAnswers = [resolvedAnswerString];
      }
    }

    const finalExplanation = inlineExplanation || keyEntry?.explanation || "";

    results.push({
      id: `parsed_${current.qNum}`,
      question: questionPrompt,
      questionType: choices.length > 0 ? "multiple_choice" : "identification",
      choices,
      correctChoiceId: finalCorrectChoiceId,
      acceptedAnswers,
      explanation: finalExplanation,
      difficulty: defaultDifficulty,
      subjectId,
    });
  }

  return results;
}
