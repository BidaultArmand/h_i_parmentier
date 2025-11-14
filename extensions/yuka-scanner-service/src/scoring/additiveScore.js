const HIGH_RISK_TAGS = [
  'en:e102', // Tartrazine
  'en:e110',
  'en:e120',
  'en:e124',
  'en:e129',
  'en:e150c',
  'en:e150d',
  'en:e171',
  'en:e249',
  'en:e250',
  'en:e251',
  'en:e252',
  'en:e320',
  'en:e321',
  'en:e338',
  'en:e339',
  'en:e340',
  'en:e341',
  'en:e407',
  'en:e450',
  'en:e451',
  'en:e452',
  'en:e627',
  'en:e631',
  'en:e632',
  'en:e950',
  'en:e951',
  'en:e952',
  'en:e954',
];

const MEDIUM_RISK_TAGS = [
  'en:e1201',
  'en:e1202',
  'en:e249',
  'en:e415',
  'en:e466',
  'en:e340',
];

export function computeAdditiveScore(additivesTags = []) {
  if (!Array.isArray(additivesTags) || additivesTags.length === 0) {
    return {
      score: 100,
      penalty: 0,
      riskyAdditives: [],
    };
  }

  let penalty = 0;
  const riskyAdditives = [];

  for (const tag of additivesTags) {
    if (HIGH_RISK_TAGS.includes(tag)) {
      penalty += 10;
      riskyAdditives.push({ tag, severity: 'high' });
    } else if (MEDIUM_RISK_TAGS.includes(tag)) {
      penalty += 5;
      riskyAdditives.push({ tag, severity: 'medium' });
    } else {
      penalty += 2;
      riskyAdditives.push({ tag, severity: 'low' });
    }
  }

  const score = Math.max(0, 100 - penalty);

  return {
    score,
    penalty,
    riskyAdditives,
  };
}
