export default function Background(): JSX.Element {
  return (
    <div aria-hidden className="bg-stage">
      <div className="blob a" />
      <div className="blob b" />
      <div className="blob c" />
      <div className="grid-overlay" />
      <div className="grain" />
    </div>
  );
}