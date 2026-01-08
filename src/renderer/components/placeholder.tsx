interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export const Placeholder = ({ className }: Props) => (
  <div
    className={
      'relative overflow-hidden rounded-sm border border-dashed border-zinc-200 opacity-75 px-4 flex items-center justify-center ' +
      className
    }
  >
    <svg fill="none" className="absolute inset-0 h-full w-full text-zinc-200">
      <defs>
        <pattern
          id="a"
          width={10}
          height={10}
          x={0}
          y={0}
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M-3 13 15-5M-5 5l18-18M-1 21 17 3"
            stroke="currentColor"
            strokeWidth={1}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#a)" />
    </svg>
  </div>
)
