"use client";

import { cn } from "@/lib/utils";

interface Mark {
  type: string;
  attrs?: Record<string, string>;
}

interface ContentNode {
  type: string;
  content?: ContentNode[];
  text?: string;
  marks?: Mark[];
  attrs?: Record<string, unknown>;
}

function renderMarks(text: string, marks?: Mark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<React.ReactNode>((children, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{children}</strong>;
      case "italic":
        return <em>{children}</em>;
      case "underline":
        return <u>{children}</u>;
      case "link":
        return (
          <a
            href={mark.attrs?.href as string}
            target={mark.attrs?.target as string}
            className="text-primary underline hover:opacity-80"
          >
            {children}
          </a>
        );
      case "textStyle":
        return <span style={mark.attrs as React.CSSProperties}>{children}</span>;
      default:
        return children;
    }
  }, text);
}

function renderNode(node: ContentNode, index: number): React.ReactNode {
  switch (node.type) {
    case "doc":
      return (
        <div key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </div>
      );

    case "paragraph":
      return (
        <p key={index} className="mb-3 leading-relaxed">
          {node.content?.map((child, i) => {
            if (child.type === "text") {
              return (
                <span key={i}>{renderMarks(child.text || "", child.marks)}</span>
              );
            }
            if (child.type === "hardBreak") {
              return <br key={i} />;
            }
            return renderNode(child, i);
          })}
        </p>
      );

    case "heading":
      const level = (node.attrs?.level as number) || 1;
      const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;
      const headingClasses: Record<number, string> = {
        1: "text-2xl font-bold mb-4 mt-6",
        2: "text-xl font-semibold mb-3 mt-5",
        3: "text-lg font-semibold mb-2 mt-4",
        4: "text-base font-medium mb-2 mt-3",
      };
      return (
        <HeadingTag key={index} className={headingClasses[level] || headingClasses[1]}>
          {node.content?.map((child, i) => {
            if (child.type === "text") {
              return (
                <span key={i}>{renderMarks(child.text || "", child.marks)}</span>
              );
            }
            return renderNode(child, i);
          })}
        </HeadingTag>
      );

    case "bulletList":
      return (
        <ul key={index} style={{ listStyleType: "disc" }} className="pl-6 mb-3 space-y-1">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index} style={{ listStyleType: "decimal" }} className="pl-6 mb-3 space-y-1">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      );

    case "listItem":
      return (
        <li key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote key={index} className="border-l-4 border-primary/30 pl-4 italic my-3 text-muted-foreground">
          {node.content?.map((child, i) => renderNode(child, i))}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre key={index} className="bg-muted rounded-md p-4 mb-3 overflow-x-auto text-sm">
          <code>
            {node.content?.map((child, i) => {
              if (child.type === "text") return child.text;
              return null;
            })}
          </code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={index} className="my-6 border-border" />;

    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={node.attrs?.src as string}
          alt={(node.attrs?.alt as string) || ""}
          title={node.attrs?.title as string}
          className="rounded-md my-4 max-w-full"
        />
      );

    case "text":
      return (
        <span key={index}>
          {renderMarks(node.text || "", node.marks)}
        </span>
      );

    case "hardBreak":
      return <br key={index} />;

    default:
      if (node.content) {
        return (
          <div key={index}>
            {node.content.map((child, i) => renderNode(child, i))}
          </div>
        );
      }
      return null;
  }
}

export function RichContent({
  content,
  className,
}: {
  content: unknown;
  className?: string;
}) {
  if (!content) return null;

  try {
    const doc = content as ContentNode;
    if (doc.type !== "doc" || !doc.content) {
      return <p className="text-muted-foreground">内容为空</p>;
    }
    return <div className={cn("rich-content", className)}>{renderNode(doc, 0)}</div>;
  } catch {
    return <p className="text-muted-foreground">内容无法显示</p>;
  }
}
