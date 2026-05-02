type HomeMarkProps = {
  className?: string;
};

export default function HomeMark({ className }: HomeMarkProps) {
  return (
    <span aria-hidden="true" className={className} style={{ lineHeight: 1 }}>
      🥁
    </span>
  );
}
