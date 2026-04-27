/**
 * Generates an SVG path for the brush handle.
 * https://medium.com/@dennismphil/one-side-rounded-rectangle-using-svg-fb31cf318d90
 */
export const brushHandlePath = (height: number) =>
  [
    // handle
    `M 0 0`, // move to (0, 0)
    `v ${height}`, // vertical line

    // head
    'M -5.5 -5.5', // move to left top corner
    'a 5.5 5.5 0 1 1 11 0', // create circular arc
    'a 5.5 5.5 0 1 1 -11 0', // create another circular arc
    'z', // close path
  ].join(' ');

export const brushHandleAccentPath = () =>
  [
    'M -10.5 -5.5', // move to left top corner
    'a 10.5 10.5 0 1 1 21 0', // create circular arc
    'a 10.5 10.5 0 1 1 -21 0', // create another circular arc
    'z', // close path
  ].join(' ');

export function OffScreenHandle({
  color,
  size = 10,
  margin = 10,
}: {
  color: string;
  size?: number;
  margin?: number;
}) {
  return (
    <polygon
      points={`0 0, ${size} ${size}, 0 ${size}`}
      transform={` translate(${size + margin}, ${margin}) rotate(45) `}
      fill={color}
      stroke={color}
      strokeWidth="4"
      strokeLinejoin="round"
    />
  );
}
