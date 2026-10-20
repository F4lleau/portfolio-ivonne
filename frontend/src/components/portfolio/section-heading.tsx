import type { ReactNode } from 'react';
export function SectionHeading({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{number} /</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
