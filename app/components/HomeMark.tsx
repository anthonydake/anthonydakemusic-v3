interface HomeMarkProps {
  className?: string;
}

export default function HomeMark({ className }: HomeMarkProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        fontSize: '17px',
        lineHeight: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        textDecoration: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      🥁
    </span>
  );
}
