import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Pilcrow,
  Upload,
  Loader2,
  Table as TableIcon
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const isInternalUpdate = useRef(false);
  const { toast } = useToast();
  
  // Image upload state
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
          target: '_blank',
          rel: 'noopener noreferrer',
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
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'article-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  // Sync content prop with editor when it changes externally (e.g., when loading article data)
  useEffect(() => {
    if (editor && content !== undefined) {
      // Skip if this is an internal update from onUpdate callback
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return;
      }
      
      // Only update if content is different from current editor content
      const currentContent = editor.getHTML();
      if (content !== currentContent) {
        editor.commands.setContent(content, false);
      }
    }
  }, [editor, content]);

  // Image upload handler - triggered by file input
  const addImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: 'Error', 
        description: 'File harus berupa gambar', 
        variant: 'destructive' 
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        title: 'Error', 
        description: 'Ukuran gambar maksimal 10MB', 
        variant: 'destructive' 
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `content/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('articles-media')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('articles-media')
        .getPublicUrl(fileName);
      
      editor.chain().focus().setImage({ src: publicUrl }).run();
      toast({ title: 'Gambar berhasil diupload!' });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal upload gambar', 
        variant: 'destructive' 
      });
    } finally {
      setIsUploadingImage(false);
      // Reset input
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }, [editor, toast]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    let url = window.prompt('URL link:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Auto-add https:// if no protocol specified
    if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
      url = 'https://' + url;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ 
      href: url,
      target: '_blank',
    }).run();
  }, [editor]);

  // Open video modal
  const addYoutube = useCallback(() => {
    setShowVideoModal(true);
    setVideoUrl('');
  }, []);

  // Handle YouTube embed
  const handleVideoEmbed = useCallback(() => {
    if (videoUrl && editor) {
      editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
      setShowVideoModal(false);
      setVideoUrl('');
      toast({ title: 'Video YouTube berhasil ditambahkan!' });
    }
  }, [editor, videoUrl, toast]);

  // Handle video file upload
  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({ 
        title: 'Error', 
        description: 'File harus berupa video', 
        variant: 'destructive' 
      });
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({ 
        title: 'Error', 
        description: 'Ukuran video maksimal 100MB', 
        variant: 'destructive' 
      });
      return;
    }

    setIsUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('articles-media')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('articles-media')
        .getPublicUrl(fileName);
      
      // Insert video as HTML5 video element
      const videoHtml = `<video controls class="rounded-lg my-4 w-full max-w-2xl mx-auto">
        <source src="${publicUrl}" type="${file.type}">
        Browser Anda tidak mendukung video.
      </video>`;
      
      editor.chain().focus().insertContent(videoHtml).run();
      toast({ title: 'Video berhasil diupload!' });
      setShowVideoModal(false);
    } catch (error) {
      console.error('Video upload error:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal upload video', 
        variant: 'destructive' 
      });
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  }, [editor, toast]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-input">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
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
          disabled={isUploadingImage}
          tooltip="Upload Image"
        >
          {isUploadingImage ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </MenuButton>
        <MenuButton 
          onClick={addYoutube}
          tooltip="Tambah Video"
        >
          <YoutubeIcon className="w-4 h-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Table */}
        <MenuButton 
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          tooltip="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </MenuButton>
      </div>
      
      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Video</DialogTitle>
            <DialogDescription>
              Embed link YouTube atau upload video langsung
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Embed Link Option */}
            <div className="space-y-2">
              <Label>Embed Link YouTube</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && videoUrl) {
                      handleVideoEmbed();
                    }
                  }}
                />
                <Button 
                  onClick={handleVideoEmbed} 
                  disabled={!videoUrl}
                >
                  Embed
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mendukung format: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">atau</span>
              </div>
            </div>
            
            {/* Upload Video Option */}
            <div className="space-y-2">
              <Label>Upload Video (Maks 100MB)</Label>
              <div className="flex gap-2">
                <Input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isUploadingVideo}
                  className="cursor-pointer"
                />
              </div>
              {isUploadingVideo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengupload video...</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RichTextEditor;
