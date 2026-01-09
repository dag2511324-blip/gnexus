/**
 * PowerPoint Viewer Component
 */

interface PPTViewerProps {
    url: string;
}

export function PPTViewer({ url }: PPTViewerProps) {
    // Use Microsoft Office Online Viewer
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

    return (
        <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title="PowerPoint Viewer"
        />
    );
}
