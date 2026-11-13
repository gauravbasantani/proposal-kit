import { useState } from "react";

import manifest from "../components.json";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";

type Prop = { name: string; type: string; required: boolean; default?: string; description: string };
type Entry = { name: string; import: string; purpose: string; props: Prop[]; do: string[]; dont: string[]; example: string };

/** The "For AI tools" docs block. It reads components.json, so the docs and the manifest can't drift apart. */
export function ForAITools({ name }: { name: string }) {
  const entry = (manifest.components as Entry[]).find((c) => c.name === name);
  const [copied, setCopied] = useState(false);
  if (!entry) return <p>No manifest entry for {name}.</p>;
  const code = `${entry.import}\n\n${entry.example}`;

  return (
    <section aria-labelledby={`ai-${name}`} className="sb-unstyled my-6 grid gap-4 rounded-lg border bg-card p-5 text-card-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id={`ai-${name}`} className="m-0 text-lg font-semibold">
          For AI tools
        </h2>
        <Badge variant="secondary">from components.json</Badge>
      </div>
      <p className="m-0 text-sm">
        <strong>What it is for.</strong> {entry.purpose}
      </p>
      <div className="grid gap-1">
        <p className="m-0 text-sm font-semibold">Required props</p>
        <ul className="m-0 grid gap-1 pl-5 text-sm">
          {entry.props
            .filter((p) => p.required)
            .map((p) => (
              <li key={p.name}>
                <code>{p.name}</code>: <code>{p.type}</code>. {p.description}
              </li>
            ))}
        </ul>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-1">
          <p className="m-0 text-sm font-semibold">Do</p>
          <ul className="m-0 grid gap-1 pl-5 text-sm">
            {entry.do.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-1">
          <p className="m-0 text-sm font-semibold">Don't</p>
          <ul className="m-0 grid gap-1 pl-5 text-sm">
            {entry.dont.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="m-0 text-sm font-semibold">Copyable example</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard?.writeText(code).then(() => setCopied(true));
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="m-0 whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-sm text-foreground">
          <code>{code}</code>
        </pre>
      </div>
    </section>
  );
}
