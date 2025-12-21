import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableWidgetProps {
    id: string;
    children: React.ReactNode;
    isEditMode: boolean;
}

export function SortableWidget({ id, children, isEditMode }: SortableWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full group relative">
            <div className="h-full">
                {children}
            </div>

            {isEditMode && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-md shadow-sm 
                     cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 
                     border hover:bg-white"
                >
                    <GripVertical className="h-4 w-4 text-slate-500" />
                </div>
            )}
        </div>
    );
}
