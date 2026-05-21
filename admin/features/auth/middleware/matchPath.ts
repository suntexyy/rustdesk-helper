export function matchPath(path: string, patterns: string[]) {
  return patterns.some((pattern) => {
    const optionalEndSlash = "\\/?";

    // If pattern ends with /* → allow extra segments
    if (pattern.endsWith("/*")) {
      const base = pattern.replace(/\/\*$/, "");
      const regex = new RegExp(`^${base}(?:\\/.*)?${optionalEndSlash}$`);
      return regex.test(path);
    }

    // Otherwise, strict match
    const regex = new RegExp(`^${pattern}${optionalEndSlash}$`);
    return regex.test(path);
  });
}
