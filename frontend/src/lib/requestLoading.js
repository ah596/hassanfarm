let pending = 0;
const listeners = new Set();

export const getPendingRequests = () => pending;
export const subscribeRequests = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function beginRequest() {
  pending += 1;
  listeners.forEach(listener => listener());
  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    pending -= 1;
    listeners.forEach(listener => listener());
  };
}
