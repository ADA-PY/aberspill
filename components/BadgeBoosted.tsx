export default function BadgeBoosted({ until }: { until?: string | null }): JSX.Element | null {
  if (!until) return null;
  const active = new Date(until) > new Date();
  if (!active) return null;
  return <span className='boost-badge'>?? Boosted</span>;
}
