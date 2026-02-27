import { useState } from 'react';

interface TruncatedNameProps {
  name: string;
  maxLength?: number;
}

export default function TruncatedName({ name, maxLength = 15 }: TruncatedNameProps) {
  const [expanded, setExpanded] = useState(false);

  if (name.length <= maxLength) {
    return <strong>&quot;{name}&quot;</strong>;
  }

  if (expanded) {
    return (
      <strong className="break-all">
        &quot;{name}&quot;
      </strong>
    );
  }

  return (
    <strong
      className="cursor-pointer underline decoration-dotted underline-offset-2 hover:text-foreground transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        setExpanded(true);
      }}
      title="Click to see full name"
    >
      &quot;{name.slice(0, maxLength)}&hellip;&quot;
    </strong>
  );
}
