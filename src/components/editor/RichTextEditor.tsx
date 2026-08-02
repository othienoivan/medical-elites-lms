import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  Bold, Braces, Code2, Heading1, Heading2, Heading3, IndentDecrease,
  IndentIncrease, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2,
  RemoveFormatting, Strikethrough, Underline as UnderlineIcon, Undo2, Unlink,
} from "lucide-react";

type Props = { content: string; onChange: (value: string) => void; placeholder?: string };

export default function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "medical-rich-text min-h-[350px] bg-white p-4 outline-none prose max-w-none",
        "aria-label": "Rich text editor",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: activeEditor }) => onChange(activeEditor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "", { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return <div className="min-h-[350px] animate-pulse rounded-xl bg-slate-100" />;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Enter the web address", previous || "https://");
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b bg-slate-50 p-2" role="toolbar" aria-label="Text formatting">
        <Tool icon={Undo2} label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
        <Tool icon={Redo2} label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
        <Divider />
        <Tool icon={Bold} label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Tool icon={Italic} label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Tool icon={UnderlineIcon} label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <Tool icon={Strikethrough} label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <Divider />
        <Tool icon={Heading1} label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <Tool icon={Heading2} label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <Tool icon={Heading3} label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <Tool icon={List} label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <Tool icon={ListOrdered} label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <Tool icon={IndentIncrease} label="Increase list level" onClick={() => editor.chain().focus().sinkListItem("listItem").run()} disabled={!editor.can().sinkListItem("listItem")} />
        <Tool icon={IndentDecrease} label="Decrease list level" onClick={() => editor.chain().focus().liftListItem("listItem").run()} disabled={!editor.can().liftListItem("listItem")} />
        <Divider />
        <Tool icon={Quote} label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <Tool icon={Code2} label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
        <Tool icon={Braces} label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <Tool icon={Minus} label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <Divider />
        <Tool icon={Link2} label="Add link" active={editor.isActive("link")} onClick={setLink} />
        <Tool icon={Unlink} label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} />
        <Tool icon={RemoveFormatting} label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function Tool({ icon: Icon, label, onClick, active = false, disabled = false }: { icon: React.ElementType; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick} className={`rounded-lg p-2 transition ${active ? "bg-blue-700 text-white" : "text-slate-700 hover:bg-white hover:text-blue-700"} disabled:cursor-not-allowed disabled:opacity-35`}><Icon size={18} /></button>;
}
function Divider() { return <span className="mx-1 h-8 w-px bg-slate-300" aria-hidden="true" />; }
