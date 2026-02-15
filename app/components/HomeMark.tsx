type HomeMarkProps = {
  className?: string;
};

export default function HomeMark({ className }: HomeMarkProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="homeMarkGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="60%" stopColor="#8EC5FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <g transform="translate(-0.4 0)">
        <rect
          x="5.6"
          y="4.2"
          width="4.8"
          height="15.6"
          rx="1.4"
          ry="1.4"
          fill="none"
          stroke="url(#homeMarkGradient)"
          strokeWidth="1.6"
        />
        <path
          d="M12.2 7.2h5.6"
          fill="none"
          stroke="url(#homeMarkGradient)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M12.2 12h7"
          fill="none"
          stroke="url(#homeMarkGradient)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M12.2 16.8h4"
          fill="none"
          stroke="url(#homeMarkGradient)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
