import { useId } from "react";
import { cn } from "~/lib/utils";

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: Array<[x: number, y: number]>;
  strokeDasharray?: string;
  className?: string;
  [key: string]: any;
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  squares,
  className,
  ...props
}: GridPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width - 1}
              height={height - 1}
              x={x * width + 1}
              y={y * height + 1}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

interface DotPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  [key: string]: any;
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}

export function CircuitBoardPattern({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  const id = useId();
  return (
    <svg
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full opacity-[0.03]", className)}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(2)"
        >
          <path
            d="M20 10a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm30 30a5 5 0 0 1 10 0v40a5 5 0 0 1-10 0V40zM10 80a5 5 0 0 1 10 0v10a5 5 0 0 1-10 0V80zm60-60a5 5 0 0 1 10 0v30a5 5 0 0 1-10 0V20z"
            fill="currentColor"
          />
          <circle cx="25" cy="10" r="3" fill="currentColor" />
          <circle cx="25" cy="60" r="3" fill="currentColor" />
          <circle cx="55" cy="40" r="3" fill="currentColor" />
          <circle cx="55" cy="80" r="3" fill="currentColor" />
          <path
            d="M25 10 L25 60 M55 40 L55 80"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <path
             d="M0 0h100v100H0z"
             fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}

