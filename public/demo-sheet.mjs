export function sheetAt(demo, index) {
  const cells = [demo.headers, ...demo.rows].map(row => [...row]);
  for (const step of demo.steps.slice(0, index + 1)) {
    for (const [address, value] of Object.entries(step.updates)) {
      const column = address.charCodeAt(0) - 65;
      const row = Number(address.slice(1)) - 1;
      cells[row] ??= [];
      cells[row][column] = value;
    }
  }
  return cells;
}
export const columnAt = index => String.fromCharCode(65 + index);
