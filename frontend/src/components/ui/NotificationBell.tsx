"use client";

import { useNotifications } from "@/context/NotificationContext";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es, ca, enUS } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, sendTestNotification } = useNotifications();
    const t = useTranslations('Notifications');
    const locale = useLocale();

    // Map locale to date-fns locale
    const dateLocale = locale === 'es' ? es : locale === 'ca' ? ca : enUS;

    // Helper to translate notification content
    const getTranslatedContent = (text: string, data?: any) => {
        // If text is a key (e.g. 'notifications.payment.success'), translate it
        if (text && (text.startsWith('notifications.') || text.includes('.'))) {
            const key = text.replace(/^notifications\./, '');
            try {
                return t(key, data) || text;
            } catch (e) {
                return text;
            }
        }
        return text;
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">{t('notifications')}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b p-4">
                    <h4 className="font-semibold">{t('title')}</h4>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-auto px-2"
                                onClick={() => markAllAsRead()}
                            >
                                {t('markAsRead')}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto px-2 text-blue-600"
                            onClick={() => sendTestNotification()}
                        >
                            🔔 {t('test')}
                        </Button>
                    </div>
                </div>
                <div className="h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex h-full items-center justify-center p-4 text-sm text-gray-500">
                            {t('noNotifications')}
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col gap-1 border-b p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer",
                                        !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                                    )}
                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={cn("text-sm font-medium", !notification.isRead && "text-blue-700 dark:text-blue-400")}>
                                            {getTranslatedContent(notification.title, notification.data)}
                                        </p>
                                        {!notification.isRead && (
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {getTranslatedContent(notification.message, notification.data)}
                                    </p>
                                    <span className="text-[10px] text-gray-400">
                                        {format(new Date(notification.createdAt), "d MMM, HH:mm", { locale: dateLocale })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover >
    );
}
