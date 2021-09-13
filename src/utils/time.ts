// in milliseconds
const units: Record<string, number> = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

export const getRelativeTime = (d1: number, d2 = new Date()) => {
  var elapsed = d1 - (d2 as any);

  const rtf =
    (Intl &&
      Intl.RelativeTimeFormat &&
      new Intl.RelativeTimeFormat('en', {
        numeric: 'auto',
      })) ||
    false;

  if (rtf) {
    // "Math.abs" accounts for both "past" & "future" scenarios
    for (let u in units)
      if (Math.abs(elapsed) > units[u] || u === 'second')
        return rtf.format(Math.round(elapsed / units[u]), u as any);
  } else {
    return new Date(elapsed).toDateString();
  }
};

export const parseDate = (dateString: string) => new Date(dateString).getTime();
