/**
 * Tiny hand-drawn pixel icons. Each icon is a grid of rows: "#" is a filled
 * cell. They use `currentColor`, so they follow the text colour.
 */

export const ARROW = ["...#...", "....#..", "#######", "....#..", "...#..."];

export const PLAY = ["#....", "##...", "###..", "####.", "###..", "##...", "#...."];

export const MAIL = [
  "#########",
  "##.....##",
  "#.#...#.#",
  "#..#.#..#",
  "#...#...#",
  "#.......#",
  "#########",
];

export function PixelSprite({
  rows,
  size = 2,
  className,
}: {
  rows: string[];
  size?: number;
  className?: string;
}) {
  const h = rows.length;
  const w = rows[0].length;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={w * size}
      height={h * size}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      fill="currentColor"
      className={className}
    >
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null,
        ),
      )}
    </svg>
  );
}
