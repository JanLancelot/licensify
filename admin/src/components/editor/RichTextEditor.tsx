"use client";

import React, { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  ImageIcon,
  Loader2,
  Code,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
} from "lucide-react";

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  placeholder = "Start writing study notes and architectural materials...",
  className = "",
}: RichTextEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert initial Markdown-like bullet points to clean HTML if needed
  const initialContent = React.useMemo(() => {
    if (!value) return "<p></p>";
    if (value.trim().startsWith("<")) return value; // Already HTML

    // Simple markdown conversion for legacy notes
    return value
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/\n\n/gim, "</p><p>")
      .replace(/\n/gim, "<br/>");
  }, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-600 dark:text-brand-400 underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap-prose min-h-[350px] p-5 sm:p-8 text-sm leading-relaxed focus:outline-none dark:text-studio-100 max-w-4xl mx-auto w-full",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/") && onUploadImage) {
            event.preventDefault();
            setUploadingImage(true);
            onUploadImage(file)
              .then((url) => {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                if (coordinates) {
                  const node = schema.nodes.image.create({ src: url });
                  const transaction = view.state.tr.insert(coordinates.pos, node);
                  view.dispatch(transaction);
                }
              })
              .catch(console.error)
              .finally(() => setUploadingImage(false));
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/") && onUploadImage) {
              const file = items[i].getAsFile();
              if (file) {
                event.preventDefault();
                setUploadingImage(true);
                onUploadImage(file)
                  .then((url) => {
                    const node = view.state.schema.nodes.image.create({ src: url });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  })
                  .catch(console.error)
                  .finally(() => setUploadingImage(false));
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      setUploadingImage(true);
      try {
        if (onUploadImage) {
          const url = await onUploadImage(file);
          editor.chain().focus().setImage({ src: url }).run();
        } else {
          // Local data URL preview fallback
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              editor.chain().focus().setImage({ src: reader.result }).run();
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error("Failed to insert image:", err);
      } finally {
        setUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [editor, onUploadImage]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-studio-200 dark:border-studio-700 bg-white dark:bg-studio-900 overflow-hidden flex flex-col shadow-sm transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 shadow-2xl border-brand-500 bg-white dark:bg-studio-950"
          : className
      }`}
    >
      {/* MS Word-like Top Ribbon / Toolbar */}
      <div className="sticky top-0 z-20 shrink-0 flex flex-wrap items-center gap-1 p-2 bg-studio-50/95 dark:bg-studio-850/95 backdrop-blur-md border-b border-studio-200 dark:border-studio-700/80 text-studio-700 dark:text-studio-300 select-none shadow-sm">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-studio-200 dark:border-studio-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-studio-200 dark:hover:bg-studio-750 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-studio-200 dark:hover:bg-studio-750 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-studio-200 dark:border-studio-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-brand-500 text-white font-bold"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-brand-500 text-white font-bold"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-brand-500 text-white font-bold"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Character Formatting: Bold, Italic, Underline, Strikethrough, Code */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-studio-200 dark:border-studio-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("bold")
                ? "bg-brand-500 text-white font-bold"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("italic")
                ? "bg-brand-500 text-white font-bold"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("underline")
                ? "bg-brand-500 text-white font-bold"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("strike")
                ? "bg-brand-500 text-white font-bold"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("code")
                ? "bg-brand-500 text-white font-bold"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Inline Code / Unit"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment Controls */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-studio-200 dark:border-studio-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive({ textAlign: "left" })
                ? "bg-brand-500 text-white"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive({ textAlign: "center" })
                ? "bg-brand-500 text-white"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Align Center (Middle)"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive({ textAlign: "right" })
                ? "bg-brand-500 text-white"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive({ textAlign: "justify" })
                ? "bg-brand-500 text-white"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-studio-200 dark:border-studio-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("bulletList")
                ? "bg-brand-500 text-white"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Bulleted List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("orderedList")
                ? "bg-brand-500 text-white"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("blockquote")
                ? "bg-brand-500 text-white"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Callout Quote / Code Provision"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded hover:bg-studio-200 dark:hover:bg-studio-750"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("link")
                ? "bg-brand-500 text-white"
                : "hover:bg-studio-200 dark:hover:bg-studio-750"
            }`}
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline Picture & Media Insertion */}
        <div className="flex items-center gap-1 pl-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-medium text-[11px] transition-colors border border-brand-500/20"
            title="Insert picture in the middle of text (or drag & drop/paste)"
          >
            {uploadingImage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            )}
            <span>Insert Image</span>
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <div className="ml-auto pl-2 flex items-center">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-studio-200 dark:hover:bg-studio-750 text-studio-400 hover:text-studio-700 dark:hover:text-studio-200"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Document Editor"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="relative flex-1 bg-white dark:bg-studio-900 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} className="min-h-full" />
        {uploadingImage && (
          <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-[1px] flex items-center justify-center gap-2 text-xs font-semibold text-studio-900 dark:text-white">
            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            <span>Uploading image to cloud storage...</span>
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="px-3 py-1.5 bg-studio-50 dark:bg-studio-850 border-t border-studio-200 dark:border-studio-700/60 flex items-center justify-between text-[10px] text-studio-500 dark:text-studio-400">
        <span>Tip: Paste (Ctrl+V) or drag images directly into the text.</span>
        <span>
          {editor.storage.characterCount
            ? `${editor.storage.characterCount.words()} words`
            : "Rich Document Format"}
        </span>
      </div>
    </div>
  );
}
