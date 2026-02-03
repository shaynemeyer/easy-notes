"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface NoteEditorProps {
  initialContent?: string;
  onChange?: (contentJson: string) => void;
  editable?: boolean;
}

export function NoteEditor({
  initialContent,
  onChange,
  editable = true,
}: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: parseContent(initialContent),
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        const json = JSON.stringify(editor.getJSON());
        onChange(json);
      }
    },
  });

  useEffect(() => {
    if (editor && initialContent) {
      const content = parseContent(initialContent);
      editor.commands.setContent(content);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-800">
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
          <EditorButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <strong>B</strong>
          </EditorButton>
          <EditorButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <em>I</em>
          </EditorButton>
          <EditorButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="Code"
          >
            {"<>"}
          </EditorButton>
          <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-700 mx-1" />
          <EditorButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            H1
          </EditorButton>
          <EditorButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            H2
          </EditorButton>
          <EditorButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            H3
          </EditorButton>
          <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-700 mx-1" />
          <EditorButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            •
          </EditorButton>
          <EditorButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            1.
          </EditorButton>
          <EditorButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Code Block"
          >
            {"{ }"}
          </EditorButton>
          <EditorButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            "
          </EditorButton>
          <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-700 mx-1" />
          <EditorButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            —
          </EditorButton>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

function EditorButton({
  onClick,
  isActive = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

function parseContent(content?: string) {
  if (!content) {
    return {
      type: "doc",
      content: [{ type: "paragraph" }],
    };
  }

  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "doc" && Array.isArray(parsed.content)) {
      return parsed;
    }
  } catch (e) {
    // Invalid JSON, return empty doc
  }

  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}
