const tokenBlacklist: Set<string> = new Set();

export const addToBlacklist = (token: string): void => {
  tokenBlacklist.add(token);
};

export const isBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};
