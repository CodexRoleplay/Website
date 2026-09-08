const MAX_STORED_TEXT = 8000;
const MAX_TITLE_LENGTH = 240;
const LCS_CELL_LIMIT = 120000;

function splitCommon(beforeTokens, afterTokens) {
  let start = 0;
  const shared = Math.min(beforeTokens.length, afterTokens.length);

  while (start < shared && beforeTokens[start] === afterTokens[start]) {
    start += 1;
  }

  let endBefore = beforeTokens.length;
  let endAfter = afterTokens.length;

  while (endBefore > start && endAfter > start && beforeTokens[endBefore - 1] === afterTokens[endAfter - 1]) {
    endBefore -= 1;
    endAfter -= 1;
  }

  return {
    prefix: beforeTokens.slice(0, start),
    beforeMid: beforeTokens.slice(start, endBefore),
    afterMid: afterTokens.slice(start, endAfter),
    suffix: beforeTokens.slice(endBefore),
  };
}

function lcsOps(beforeTokens, afterTokens) {
  const beforeCount = beforeTokens.length;
  const afterCount = afterTokens.length;
  const columnCount = afterCount + 1;
  const table = new Uint32Array((beforeCount + 1) * columnCount);
  const cell = (row, column) => row * columnCount + column;

  for (let row = 1; row <= beforeCount; row += 1) {
    for (let column = 1; column <= afterCount; column += 1) {
      table[cell(row, column)] =
        beforeTokens[row - 1] === afterTokens[column - 1]
          ? table[cell(row - 1, column - 1)] + 1
          : Math.max(table[cell(row - 1, column)], table[cell(row, column - 1)]);
    }
  }

  const ops = [];
  let row = beforeCount;
  let column = afterCount;

  while (row > 0 && column > 0) {
    if (beforeTokens[row - 1] === afterTokens[column - 1]) {
      ops.push({ type: "eq", value: beforeTokens[row - 1] });
      row -= 1;
      column -= 1;
    } else if (table[cell(row - 1, column)] >= table[cell(row, column - 1)]) {
      ops.push({ type: "del", value: beforeTokens[row - 1] });
      row -= 1;
    } else {
      ops.push({ type: "add", value: afterTokens[column - 1] });
      column -= 1;
    }
  }

  while (row > 0) {
    ops.push({ type: "del", value: beforeTokens[row - 1] });
    row -= 1;
  }

  while (column > 0) {
    ops.push({ type: "add", value: afterTokens[column - 1] });
    column -= 1;
  }

  ops.reverse();
  return ops;
}

export function diffArrays(beforeTokens, afterTokens) {
  if (!beforeTokens.length && !afterTokens.length) {
    return [];
  }

  const { prefix, beforeMid, afterMid, suffix } = splitCommon(beforeTokens, afterTokens);
  const ops = prefix.map((value) => ({ type: "eq", value }));

  if (!beforeMid.length) {
    for (const value of afterMid) {
      ops.push({ type: "add", value });
    }
  } else if (!afterMid.length) {
    for (const value of beforeMid) {
      ops.push({ type: "del", value });
    }
  } else if (beforeMid.length * afterMid.length > LCS_CELL_LIMIT) {
    for (const value of beforeMid) {
      ops.push({ type: "del", value });
    }
    for (const value of afterMid) {
      ops.push({ type: "add", value });
    }
  } else {
    ops.push(...lcsOps(beforeMid, afterMid));
  }

  for (const value of suffix) {
    ops.push({ type: "eq", value });
  }

  return ops;
}

function splitLines(value) {
  if (value == null || value === "") {
    return [];
  }

  return String(value).split("\n");
}

function tokenizeWords(value) {
  return String(value).match(/\s+|\p{L}+|\p{N}+|[^\s\p{L}\p{N}]+/gu) ?? [];
}

function partsFromWordOps(ops, keepType) {
  return ops
    .filter((op) => op.type === "eq" || op.type === keepType)
    .map((op) => ({ type: op.type, text: op.value }));
}

function appendReplacementLines(lines, deletedLines, addedLines) {
  const pairCount = Math.min(deletedLines.length, addedLines.length);

  for (let index = 0; index < pairCount; index += 1) {
    const wordOps = diffArrays(tokenizeWords(deletedLines[index]), tokenizeWords(addedLines[index]));
    lines.push({ type: "del", parts: partsFromWordOps(wordOps, "del") });
    lines.push({ type: "add", parts: partsFromWordOps(wordOps, "add") });
  }

  for (let index = pairCount; index < deletedLines.length; index += 1) {
    lines.push({ type: "del", parts: [{ type: "del", text: deletedLines[index] }] });
  }

  for (let index = pairCount; index < addedLines.length; index += 1) {
    lines.push({ type: "add", parts: [{ type: "add", text: addedLines[index] }] });
  }
}

function collapseUnchangedLines(lines, context = 2) {
  if (!lines.length) {
    return [];
  }

  const keep = Array(lines.length).fill(false);
  let hasChange = false;

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].type === "context") {
      continue;
    }

    hasChange = true;
    keep[index] = true;

    for (let distance = 1; distance <= context; distance += 1) {
      if (index - distance >= 0) {
        keep[index - distance] = true;
      }
      if (index + distance < lines.length) {
        keep[index + distance] = true;
      }
    }
  }

  if (!hasChange) {
    return lines;
  }

  const visible = [];
  let skipped = 0;

  for (let index = 0; index < lines.length; index += 1) {
    if (keep[index]) {
      if (skipped > 0) {
        visible.push({ type: "skip", count: skipped, parts: [] });
        skipped = 0;
      }
      visible.push(lines[index]);
    } else {
      skipped += 1;
    }
  }

  if (skipped > 0) {
    visible.push({ type: "skip", count: skipped, parts: [] });
  }

  return visible;
}

export function buildDiffLines(before, after) {
  const beforeLines = splitLines(before);
  const afterLines = splitLines(after);
  const ops = diffArrays(beforeLines, afterLines);
  const lines = [];
  let index = 0;

  while (index < ops.length) {
    if (ops[index].type === "eq") {
      lines.push({ type: "context", parts: [{ type: "eq", text: ops[index].value }] });
      index += 1;
      continue;
    }

    const deletedLines = [];
    const addedLines = [];

    while (index < ops.length && ops[index].type !== "eq") {
      if (ops[index].type === "del") {
        deletedLines.push(ops[index].value);
      } else {
        addedLines.push(ops[index].value);
      }
      index += 1;
    }

    appendReplacementLines(lines, deletedLines, addedLines);
  }

  return collapseUnchangedLines(lines);
}

export function createTextChange(title, before, after) {
  const from = String(before ?? "");
  const to = String(after ?? "");

  if (from === to) {
    return null;
  }

  return {
    title: String(title || "Modification"),
    kind: !from ? "added" : !to ? "removed" : "modified",
    before: from,
    after: to,
  };
}

export function serializeChangeDetails(details, limit = 80) {
  if (!Array.isArray(details)) {
    return [];
  }

  return details
    .filter(Boolean)
    .slice(0, limit)
    .map((detail) => ({
      title: String(detail.title ?? "Modification").slice(0, MAX_TITLE_LENGTH),
      kind: detail.kind === "added" || detail.kind === "removed" ? detail.kind : "modified",
      before: String(detail.before ?? "").slice(0, MAX_STORED_TEXT),
      after: String(detail.after ?? "").slice(0, MAX_STORED_TEXT),
    }));
}

export function normalizeChangeDetails(details) {
  if (!Array.isArray(details)) {
    return [];
  }

  return details
    .map((detail) => {
      if (!detail || typeof detail !== "object") {
        return null;
      }

      const before = String(detail.before ?? "");
      const after = String(detail.after ?? "");

      if (!before && !after) {
        return null;
      }

      return {
        title: String(detail.title ?? "Modification"),
        kind: detail.kind === "added" || detail.kind === "removed" ? detail.kind : "modified",
        before,
        after,
      };
    })
    .filter(Boolean);
}
