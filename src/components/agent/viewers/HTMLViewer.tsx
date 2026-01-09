/**
 * HTML Viewer Component
 */

interface HTMLViewerProps {
    content?: string;
    url?: string;
}

export function HTMLViewer({ content, url }: HTMLViewerProps) {
    if (url) {
        return (
            <iframe
                src={url}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
            />
        );
    }

    if (content) {
        return (
            <iframe
                srcDoc={content}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
            />
        );
    }

    return (
        <div className="flex items-center justify-center h-full text-gray-500">
            No HTML content available
        </div>
    );
}
