import Link from "next/link";
import { useRouter } from "next/router";

export default function Tabs(): JSX.Element {
  const r = useRouter();
  const tab = (r.query.tab as string) || "new";
  const base = "/";
  return (
    <div className="flex gap-2">
      <Link className={`pill text-sm ${tab==="new"?"tab-on":"tab"}`} href={`${base}?tab=new`}>Newest</Link>
      <Link className={`pill text-sm ${tab==="top"?"tab-on":"tab"}`} href={`${base}?tab=top`}>Top 24h</Link>
    </div>
  );
}