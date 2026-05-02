interface HomeMarkProps {
  className?: string;
}

export default function HomeMark({ className }: HomeMarkProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        fontSize: '20px',
        lineHeight: '32px',
        display: 'block',
        width: '32px',
        height: '32px',
        textAlign: 'center',
        textDecoration: 'none',
      }}
    >
      🥁
    </span>
  );
}
