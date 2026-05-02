interface HomeMarkProps {
  className?: string;
}

export default function HomeMark({ className }: HomeMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        width: '100%',
        height: '100%',
      }}
    >
      🥁
    </span>
  );
}
