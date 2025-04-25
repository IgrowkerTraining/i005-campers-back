export const RESERVATION_ERROR_MESSAGES = {
  PAST_DAY: 'Cannot generate reservations for past days.',
  END_DATE_INVALID: 'The reservation start date must be less than the end date.',
  LIMIT_EXCEEDED: 'The reservation exceeds the number of people or tents allowed in the campsite.',
  LIMIT_DAY_EXCEEDED: 'The reservation exceeds the limit of tents or persons allowed on any of the selected dates.',
  NOT_AVAILABILITY: 'The reservation exceeds the limit of tents or persons allowed on any of the selected dates.',
} as const;
