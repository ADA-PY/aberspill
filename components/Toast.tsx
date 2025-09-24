import { useEffect, useState } from "react";
export default function Toast({ message }: { message?: string }): JSX.Element | null {
  const [show, setShow] = useState(!!message);
  useEffect(() => setShow(!!message), [message]);
  if (!show || !message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-zinc-800 px-4 py-2 text-sm shadow-lg">
      {message}
    </div>
  );
}
