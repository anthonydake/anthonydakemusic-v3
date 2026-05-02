interface HomeMarkProps {
  className?: string;
}

export default function HomeMark({ className }: HomeMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        fontSize: '14px',
        lineHeight: 1,
        textDecoration: 'none',
        position: 'relative',
        top: '0px',
        left: '0px',
      }}
    >
      🥁
    </span>
  );
}
