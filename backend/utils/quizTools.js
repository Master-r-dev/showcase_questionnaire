function validateAnswer(answer, existingStep, providedMode) {
  if (providedMode !== existingStep.mode) {
    throw new Error(
      `Step type mismatch: expected ${existingStep.mode}, got ${providedMode}`
    );
  }

  switch (existingStep.mode) {
    case "input":
      // Validate that the correct answer is a non-empty string
      if (
        !existingStep.correctAnswers.some((correctAnswer) =>
          new RegExp(`^${correctAnswer}$`, "i").test(answer)
        )
      ) {
        return false;
      }
      break;

    case "multi-choice":
      // Validate that provided options and correct answers match
      if (
        JSON.stringify(answer.sort()) !==
        JSON.stringify(existingStep.correctAnswers.sort())
      ) {
        return false;
      }
      break;

    case "single-choice":
    case "numeric":
      // Validate that the correct answer matches one of the options or the correct numeric value
      if (!existingStep.correctAnswers.includes(answer)) {
        return false;
      }
      break;

    default:
      throw new Error(`Unsupported step mode: ${existingStep.mode}`);
  }

  return true;
}

export { validateAnswer };
