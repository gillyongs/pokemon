import sampleList from "../Pokemon/pokemonSampleList";

export const getScoutCandidatePool = (team = []) => {
  const teamDexNos = new Set((Array.isArray(team) ? team : []).map((pokemon) => pokemon?.dexNo).filter(Boolean));
  const seenDexNos = new Set();

  return (sampleList.items || []).filter((sample) => {
    if (!sample?.dexNo || teamDexNos.has(sample.dexNo) || seenDexNos.has(sample.dexNo)) return false;
    seenDexNos.add(sample.dexNo);
    return true;
  });
};

export const drawScoutCandidates = (team = [], count = 10) => {
  const pool = getScoutCandidatePool(team);
  const legendaryCandidates = pool.filter((candidate) => candidate.feature?.legendary);
  const regularCandidates = pool.filter((candidate) => !candidate.feature?.legendary);
  const includeLegendary = legendaryCandidates.length > 0 && Math.random() < 0.1;
  const selected = [...regularCandidates];

  for (let index = selected.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [selected[index], selected[randomIndex]] = [selected[randomIndex], selected[index]];
  }

  const candidates = selected.slice(0, count - (includeLegendary ? 1 : 0));
  if (includeLegendary && candidates.length < count) {
    const randomIndex = Math.floor(Math.random() * legendaryCandidates.length);
    candidates.push(legendaryCandidates[randomIndex]);
  }

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[randomIndex]] = [candidates[randomIndex], candidates[index]];
  }

  return candidates;
};
