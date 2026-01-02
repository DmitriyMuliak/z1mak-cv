interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

export const formatToUserDate = (
  dateInput: string | number | Date,
  options: FormatDateOptions = {},
): string => {
  try {
    const { locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US', ...rest } =
      options;

    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...rest,
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return String(dateInput);
  }
};
