"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ---------------------------------------------------------------------------
// ReportMarkdownViewer - Renders markdown content with GitHub Flavored Markdown
// Supports tables, code blocks, headers, lists, and more.
// Uses Tailwind typography for automatic styling.
// ---------------------------------------------------------------------------

export interface ReportMarkdownViewerProps {
  markdown: string;
}

export function ReportMarkdownViewer({ markdown }: ReportMarkdownViewerProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
