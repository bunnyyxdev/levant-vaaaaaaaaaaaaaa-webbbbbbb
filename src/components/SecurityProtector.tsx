'use client';

import { useEffect } from 'react';

/**
 * SecurityProtector
 * Implements client-side security measures to protect the VA's code and assets.
 * 1. Blocks right-click context menu
 * 2. Blocks specialized shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, etc.)
 * 3. Registers sw-protector Service Worker
 * 4. Disables image dragging
 */
export default function SecurityProtector() {
    useEffect(() => {
        // 1. Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw-protector.js')
                .then(reg => console.log('Protector Service Worker registered'))
                .catch(err => console.error('Protector Service Worker registration failed:', err));
        }

        // 2. Disable Right-Click
        const handleContextMenu = (e: MouseEvent) => {
            // Allow right-click on inputs and textareas
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
            
            e.preventDefault();
        };

        // 3. Disable Keyboard Shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block F12
            if (e.key === 'F12') {
                e.preventDefault();
                return;
            }

            // Block Ctrl+Shift+I/J/C (DevTools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault();
                return;
            }

            // Block Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return;
            }

            // Block Ctrl+S (Save Page)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                return;
            }

            // Block Ctrl+P (Print)
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                return;
            }
        };

        // 4. Disable Image Dragging
        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                e.preventDefault();
            }
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('dragstart', handleDragStart);

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    // Also inject CSS to prevent text selection globally except in form elements
    return (
        <style jsx global>{`
            * {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            input, textarea, [contenteditable="true"] {
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text;
            }
            img {
                -webkit-user-drag: none;
                -khtml-user-drag: none;
                -moz-user-drag: none;
                -o-user-drag: none;
                user-drag: none;
            }
        `}</style>
    );
}
