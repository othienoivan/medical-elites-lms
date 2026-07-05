import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  content: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({
  content,
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [StarterKit],

    content,

    editorProps: {
      attributes: {
        class:
          "min-h-[350px] rounded-b-xl border border-slate-300 bg-white p-4 outline-none prose max-w-none",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
      {/* Toolbar */}

      <div className="flex flex-wrap gap-2 border-b bg-slate-50 p-3">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />

        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />

        <ToolbarButton
          label="H1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        />

        <ToolbarButton
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />

        <ToolbarButton
          label="• List"
          active={editor.isActive("bulletList")}
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        />

        <ToolbarButton
          label="1. List"
          active={editor.isActive("orderedList")}
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        />

        <ToolbarButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
        />

        <ToolbarButton
          label="Code"
          active={editor.isActive("codeBlock")}
          onClick={() =>
            editor.chain().focus().toggleCodeBlock().run()
          }
        />

        <ToolbarButton
          label="Undo"
          onClick={() =>
            editor.chain().focus().undo().run()
          }
        />

        <ToolbarButton
          label="Redo"
          onClick={() =>
            editor.chain().focus().redo().run()
          }
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active = false,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-blue-700 text-white"
          : "bg-white hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}