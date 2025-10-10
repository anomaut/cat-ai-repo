function contentChecker() {

  return function basicCheck(item) {
    const seenContents = new Set();

    const content = (item.content || "").trim();

    if (!content) return false;

    if (seenContents.has(content.toLowerCase())) return false;
    seenContents.add(content.toLowerCase());

    if (content.length < 10) return false;

    const safeRegex = /^[\p{L}\p{N}\p{P}\p{S}\s]+$/u;
    if (!safeRegex.test(content)) return false;

    return true;
  };
}

export { contentChecker }