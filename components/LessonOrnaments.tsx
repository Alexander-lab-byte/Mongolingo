import { useId } from "react";

/** Original vector ornaments inspired by Mongolian woven knots and painted ger trim. */
export function Knot({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="5" strokeLinejoin="round">
      <path d="m60 12 48 48-48 48L12 60Z" />
      <path d="M36 12H12v24l72 72h24V84L36 12ZM84 12h24v24l-72 72H12V84L84 12Z" />
      <path d="M36 36h48v48H36z" />
      <path d="M48 24v24H24m72 0H72V24M24 72h24v24m24 0V72h24" />
    </g>
  </svg>;
}

export function GerIllustration({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return <svg className={className} viewBox="0 0 480 300" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-felt`} x1="240" y1="110" x2="240" y2="266" gradientUnits="userSpaceOnUse"><stop stopColor="#fff3d7" /><stop offset="1" stopColor="#d8c4a1" /></linearGradient>
      <linearGradient id={`${id}-door`} x1="219" y1="184" x2="267" y2="258" gradientUnits="userSpaceOnUse"><stop stopColor="#c56843" /><stop offset="1" stopColor="#944433" /></linearGradient>
    </defs>
    <circle cx="302" cy="104" r="68" fill="#e7b863" opacity=".16" />
    <circle cx="302" cy="104" r="51" stroke="#e7b863" strokeWidth="1" opacity=".4" />
    <path d="M18 232 98 187l69 39 95-72 100 65 91-36v91H18Z" fill="#36675f" />
    <path d="m12 257 87-39 112 45 126-45 130 36v34H12Z" fill="#214d46" />
    <ellipse cx="246" cy="268" rx="157" ry="15" fill="#102d2b" opacity=".45" />
    <path d="M110 171h268v71c-55 35-213 35-268 0Z" fill={`url(#${id}-felt)`} />
    <path d="m244 85 143 83c-50 35-234 35-286 0L244 85Z" fill="#f4e8cf" />
    <path d="m244 85-83 104m83-104 84 104m-84-104v111" stroke="#cab38e" strokeWidth="2" />
    <path d="M101 168c55 35 233 35 286 0" stroke="#c17b44" strokeWidth="12" />
    <path d="M104 166c59 35 228 35 280 0" stroke="#e8c274" strokeWidth="3" strokeDasharray="7 5" />
    <path d="M110 214c70 27 200 27 268 0m-268 28c61 29 206 29 268 0" stroke="#ac8f63" strokeWidth="3" />
    <ellipse cx="244" cy="87" rx="21" ry="8" fill="#cf8b49" />
    <ellipse cx="244" cy="84" rx="17" ry="6" fill="#183b35" stroke="#e1b768" strokeWidth="2" />
    <path d="M304 131v-34" stroke="#9b8a6b" strokeWidth="6" />
    <g data-smoke="true" stroke="#e6d0a1" strokeLinecap="round" opacity=".6"><path d="M304 82c-12-13 13-20 0-34" /><path d="M312 73c-9-9 12-16 4-27" /></g>
    <path d="M218 190h52v73h-52Z" fill={`url(#${id}-door)`} stroke="#b8894f" strokeWidth="5" />
    <path d="M225 198h38v57h-38Z" stroke="#e5b969" strokeWidth="1.5" />
    <path d="m244 209 11 13-11 13-11-13Z" stroke="#e5b969" strokeWidth="2" />
    <path d="m244 216 5 6-5 6-5-6Z" fill="#e5b969" />
    <path d="M207 266h73l10 9h-93Z" fill="#a98453" />
    <path d="M62 266v-18m-5 18-4-9m14 9 4-13m329 13v-19m-5 18-4-7m13 7 4-12" stroke="#9fba84" strokeWidth="2" strokeLinecap="round" />
    <g stroke="#e2bd76" strokeWidth="1.5" strokeLinecap="round" opacity=".65"><path d="M91 88h32m-23-7h14M365 64h35m-25 8h14M382 134h38" /></g>
    <path d="m166 80 6-3 6 3m206 23 5-3 5 3" stroke="#eed19c" strokeWidth="1.5" strokeLinecap="round" />
  </svg>;
}
