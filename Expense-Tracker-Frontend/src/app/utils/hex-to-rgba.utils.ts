export function hexToRgba(hex: string, opacity: number): string {
  if (!hex) return '#E0E0E0'; // Fallback color

  // Remove the '#' from the hex color
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Return RGBA string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
