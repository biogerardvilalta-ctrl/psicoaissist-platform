import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';

import { SortableWidget } from './SortableWidget';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Pencil, X } from 'lucide-react';

interface DashboardGridProps {
    items: string[];
    renderItem: (id: string) => React.ReactNode;
    onSave: (items: string[]) => void;
    defaultItems?: string[];
}

export function DashboardGrid({ items: initialItems, renderItem, onSave, defaultItems }: DashboardGridProps) {
    const [items, setItems] = useState<string[]>(initialItems);
    const [isEditMode, setIsEditMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Update internal state when props change (initial load)
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.indexOf(active.id.toString());
                const newIndex = items.indexOf(over.id.toString());
                const newOrder = arrayMove(items, oldIndex, newIndex);
                setHasChanges(true); // Mark as dirty
                return newOrder;
            });
        }
    };

    const handleSave = () => {
        onSave(items);
        setHasChanges(false);
        setIsEditMode(false);
    };

    const handleReset = () => {
        if (defaultItems) {
            setItems(defaultItems);
            setHasChanges(true);
        }
    };

    const handleCancel = () => {
        setItems(initialItems); // Revert to initial props
        setHasChanges(false);
        setIsEditMode(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2 mb-4">
                {isEditMode ? (
                    <>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Diseño
                        </Button>
                    </>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar Diseño
                    </Button>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {items.map((id) => (
                            // Special case for full-width items if needed, handled by class logic in parent or here
                            <div key={id} className={
                                id === 'sessionsChart' || id === 'weeklyChart' || id === 'todaysSessions'
                                    ? "col-span-1 md:col-span-2 row-span-2"
                                    : "col-span-1 row-span-1"
                            }>
                                <SortableWidget id={id} isEditMode={isEditMode}>
                                    {renderItem(id)}
                                </SortableWidget>
                            </div>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
