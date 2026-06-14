function chunkText(text, size = 1000) {
  if (!text) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size;
  }

  return chunks;
}

/*
========================================
FAST LOCAL SCORING (NO VECTOR DB)
========================================
*/
function findBestChunk(chunks, query) {
  if (!chunks.length) return "";

  const words = query
    .toLowerCase()
    .split(" ")
    .filter(w => w.length > 2);

  let bestScore = -1;
  let bestChunk = chunks[0];

  for (const chunk of chunks) {
    const text = chunk.toLowerCase();
    let score = 0;

    for (const word of words) {
      if (text.includes(word)) {
        score += 2;
      }
    }

    score += words.filter(w => text.includes(w)).length;

    if (score > bestScore) {
      bestScore = score;
      bestChunk = chunk;
    }
  }

  return bestChunk;
}

module.exports = {
  chunkText,
  findBestChunk
};