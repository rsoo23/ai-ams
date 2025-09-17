import React from "react";
import { ReactNode } from "react"

export function TypographyH1({
  children,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance" {...props}>
      {children}
    </h1>
  );
}


export function TypographyH2({ children, ...props }: { children: ReactNode } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0" {...props}>
      {children}
    </h2>
  );
}


export function TypographyH3({ children, ...props }: { children: ReactNode } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight" {...props}>
      {children}
    </h3>
  );
}


export function TypographyH4({ children, ...props }: { children: ReactNode } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight" {...props}>
      {children}
    </h4>
  );
}


export function TypographyP({ children, className = "", ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={className} {...props}>
      {children}
    </p>
  );
}
