interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  size?: "sm" | "lg";
}

const sizeClasses = {
  sm: "p-3 text-xs",
  lg: "p-6 text-sm",
};

export function CodeBlock({
  code,
  language = "typescript",
  title,
  size = "sm",
}: CodeBlockProps) {
  return (
    <div className="h-full bg-[#0d1117] w-full overflow-hidden rounded-none border border-fd-border font-mono">
      {title && (
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-fd-border bg-muted/30">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-[13px] text-fd-muted-foreground">
            {title}
          </span>
        </div>
      )}
      <div className={`${sizeClasses[size]} overflow-x-auto`}>
        <pre className="text-[14px] leading-relaxed text-gray-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}