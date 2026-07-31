export function canvasToWebP(canvas: HTMLCanvasElement, quality = 0.8): string {
  return canvas.toDataURL('image/webp', quality)
}
