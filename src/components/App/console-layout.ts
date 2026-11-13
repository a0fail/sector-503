// Illustrator: координаты левого края / середины высоты, PNG экспортированы в 300 dpi.
export function consolePosition(x: number, y: number, width: number, height: number) {
  const pixelsPerMm = 300 / 25.4;
  return {
    left: `${(((x - 0.381) * pixelsPerMm) / 7418) * 100}%`,
    top: `${(((y - 156.324) * pixelsPerMm + 3698 / 2 - height / 2) / 3698) * 100}%`,
    width: `${(width / 7418) * 100}%`,
    height: `${(height / 3698) * 100}%`,
  };
}
