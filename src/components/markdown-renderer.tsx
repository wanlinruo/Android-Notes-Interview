import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

function textToId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
}

function childrenToText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return childrenToText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

const headingComponents: Partial<Components> = {
  h2: ({ children, node: _node, ...props }) => {
    const id = textToId(childrenToText(children));
    return <h2 id={id} {...props}>{children}</h2>;
  },
  h3: ({ children, node: _node, ...props }) => {
    const id = textToId(childrenToText(children));
    return <h3 id={id} {...props}>{children}</h3>;
  },
  h4: ({ children, node: _node, ...props }) => {
    const id = textToId(childrenToText(children));
    return <h4 id={id} {...props}>{children}</h4>;
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={headingComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
