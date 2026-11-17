import { describe, expect, it } from "vitest";
import { parseMockExamText } from "./examParser";
import { Id } from "@convex/_generated/dataModel";

const mockSubjectId = "k97a79y95h8atz0hphmj03785d8d4bz3" as Id<"subjects">;

describe("parseMockExamText", () => {
  it("correctly parses a 30-question mock exam with an Answer Key section at the bottom", () => {
    // Generate sample 30 questions
    const questionBlocks: string[] = [];
    const answerKeys: string[] = [];

    for (let i = 1; i <= 30; i++) {
      const correctLetter = ["a", "b", "c", "d"][(i - 1) % 4];
      questionBlocks.push(
        `${i}. What is the architectural code provision for item number ${i}?\n` +
        `A. Option A provision for ${i}\n` +
        `B. Option B provision for ${i}\n` +
        `C. Option C provision for ${i}\n` +
        `D. Option D provision for ${i}\n`
      );
      answerKeys.push(`${i}. ${correctLetter.toUpperCase()} - Reference standard for ${i}`);
    }

    const fullDoc =
      "ARCHITECTURAL LICENSURE EXAMINATION MOCK TEST\n\n" +
      questionBlocks.join("\n") +
      "\n\nANSWER KEY:\n" +
      answerKeys.join("\n");

    const parsed = parseMockExamText(fullDoc, {
      subjectId: mockSubjectId,
      defaultDifficulty: "medium",
    });

    expect(parsed.length).toBe(30);

    // Verify first question
    expect(parsed[0].question).toBe("What is the architectural code provision for item number 1?");
    expect(parsed[0].choices?.length).toBe(4);
    expect(parsed[0].choices?.[0].text).toBe("Option A provision for 1");
    expect(parsed[0].correctChoiceId).toBe("a");
    expect(parsed[0].explanation).toBe("Reference standard for 1");

    // Verify question 2 (should have correctChoiceId "b")
    expect(parsed[1].correctChoiceId).toBe("b");

    // Verify question 30
    expect(parsed[29].question).toBe("What is the architectural code provision for item number 30?");
    expect(parsed[29].correctChoiceId).toBe(["a", "b", "c", "d"][(30 - 1) % 4]);
  });

  it("parses questions with inline Answer and Explanation", () => {
    const text = `
1. Under PD 1096, what is the minimum ceiling height for habitable rooms with artificial ventilation?
A. 2.10 meters
B. 2.40 meters
C. 2.70 meters
D. 3.00 meters
Answer: B
Explanation: Section 707 requires at least 2.40m for habitable rooms with artificial ventilation.

2. What is the maximum ramp gradient under BP 344?
A) 1:10
B) 1:12
C) 1:15
D) 1:20
Ans: B
Rationale: Rule II Sec 1 sets maximum gradient to 1:12.
    `;

    const parsed = parseMockExamText(text, {
      subjectId: mockSubjectId,
      defaultDifficulty: "hard",
    });

    expect(parsed.length).toBe(2);
    expect(parsed[0].correctChoiceId).toBe("b");
    expect(parsed[0].explanation).toContain("Section 707");
    expect(parsed[1].correctChoiceId).toBe("b");
    expect(parsed[1].explanation).toContain("Rule II Sec 1");
  });

  it("handles multi-column answer keys like '1. A  2. B  3. C'", () => {
    const text = `
1. Question one
A. Choice 1
B. Choice 2

2. Question two
A. Choice A
B. Choice B

3. Question three
A. Alpha
B. Beta

ANSWER KEY:
1. A   2. B   3. B
    `;

    const parsed = parseMockExamText(text, {
      subjectId: mockSubjectId,
    });

    expect(parsed.length).toBe(3);
    expect(parsed[0].correctChoiceId).toBe("a");
    expect(parsed[1].correctChoiceId).toBe("b");
    expect(parsed[2].correctChoiceId).toBe("b");
  });
});
