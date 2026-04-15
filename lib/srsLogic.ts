export type SRSLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface SRSInput {
  interval: number;
  repetition_count: number;
  easiness_factor: number;
  isCorrect: boolean;
}

interface SRSOutput {
  interval: number;
  repetition_count: number;
  next_review: Date;
}

/**
 * Simplified SM-2 Algorithm Implementation
 */
export function calculateNextReview({
  interval,
  repetition_count,
  easiness_factor,
  isCorrect
}: SRSInput): SRSOutput {
  let new_interval: number;
  let new_repetition_count: number;

  if (!isCorrect) {
    // Si es "No Sabida": Reiniciar interval = 1, repetition_count = 0.
    new_interval = 1;
    new_repetition_count = 0;
  } else {
    // Si es "Sabida"
    if (repetition_count === 0) {
      new_interval = 1;
    } else if (repetition_count === 1) {
      new_interval = 6;
    } else {
      new_interval = Math.round(interval * easiness_factor);
    }
    new_repetition_count = repetition_count + 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + new_interval);

  return {
    interval: new_interval,
    repetition_count: new_repetition_count,
    next_review: nextReviewDate,
  };
}
