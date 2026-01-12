import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Youtube as YoutubeIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Pilcrow
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  tooltip, 
  children 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isActive ? 'default' : 'ghost'}
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg my-4 mx-auto',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Mulai menulis konten...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('URL gambar:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL link:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt('URL YouTube:');
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-input">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/50">
        {/* Undo/Redo */}
        <MenuButton 
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="Undo"
        >
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="Redo"
        >
          <Redo className="w-4 h-4" />
        </MenuButton>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Text Formatting */}
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          tooltip="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          tooltip="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          tooltip="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          tooltip="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </MenuButton>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Headings */}
        <MenuButton 
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          tooltip="Paragraph"
        >
          <Pilcrow className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          tooltip="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          tooltip="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          tooltip="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </MenuButton>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Lists */}
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          tooltip="Bullet List"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          tooltip="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Alignment */}
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          tooltip="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          tooltip="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          tooltip="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </MenuButton>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Block Elements */}
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          tooltip="Quote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          tooltip="Code Block"
        >
          <Code className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tooltip="Horizontal Line"
        >
          <Minus className="w-4 h-4" />
        </MenuButton>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Media */}
        <MenuButton 
          onClick={addLink}
          isActive={editor.isActive('link')}
          tooltip="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={addImage}
          tooltip="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={addYoutube}
          tooltip="Embed YouTube"
        >
          <YoutubeIcon className="w-4 h-4" />
        </MenuButton>
      </div>
      
      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
