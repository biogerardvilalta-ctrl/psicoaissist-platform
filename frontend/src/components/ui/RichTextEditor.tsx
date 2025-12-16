import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, disabled }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Sync initial value or external updates
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML && !isFocused) {
            editorRef.current.innerHTML = value;
        }
    }, [value, isFocused]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const ToolbarButton = ({ icon: Icon, command, arg, title }: { icon: any, command: string, arg?: string, title: string }) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                execCommand(command, arg);
            }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            title={title}
            disabled={disabled}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className={`border rounded-md overflow-hidden bg-white ${isFocused ? 'ring-2 ring-blue-100 border-blue-400' : 'border-gray-300'} transition-all`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
                <ToolbarButton icon={Bold} command="bold" title="Negrita" />
                <ToolbarButton icon={Italic} command="italic" title="Cursiva" />
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <ToolbarButton icon={Heading1} command="formatBlock" arg="H3" title="Encabezado 1" />
                <ToolbarButton icon={Heading2} command="formatBlock" arg="H4" title="Encabezado 2" />
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <ToolbarButton icon={List} command="insertUnorderedList" title="Lista con viñetas" />
                <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Lista numerada" />
                <ToolbarButton icon={Quote} command="formatBlock" arg="blockquote" title="Cita" />
                {/* <div className="ml-auto flex items-center gap-1">
                    <ToolbarButton icon={Undo} command="undo" title="Deshacer" />
                    <ToolbarButton icon={Redo} command="redo" title="Rehacer" />
                </div> */}
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto focus:outline-none prose max-w-none text-sm leading-relaxed"
                contentEditable={!disabled}
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                data-placeholder={placeholder}
                style={{ whiteSpace: 'pre-wrap' }}
            />
            {/* Simple placeholder styling via empty css if needed, or JS check */}
            {!value && !isFocused && (
                <div className="absolute top-[90px] left-6 text-gray-400 pointer-events-none text-sm">
                    {placeholder || 'Escribe aquí...'}
                </div>
            )}
        </div>
    );
};
