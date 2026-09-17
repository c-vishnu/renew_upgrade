export default function Pill({ tone = 'neutral', children, dot }) {
  return (
    <span className={`pill pill--${tone}`}>
      {dot && <span className="pill__dot" />}
      {children}
    </span>
  );
}
