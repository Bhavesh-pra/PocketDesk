export const getSessionId = (): string => {
  let sessionId = localStorage.getItem("sessionId");

  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2);
    localStorage.setItem("sessionId", sessionId);
  }

  return sessionId;
};