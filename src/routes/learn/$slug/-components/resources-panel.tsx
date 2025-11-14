import { Download, FileText, FileImage, FileVideo, FileArchive, File } from "lucide-react";
import { type Attachment } from "~/db/schema";

interface ResourcesPanelProps {
  attachments: Attachment[];
}

function getFileIcon(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
    case 'txt':
    case 'md':
    case 'doc':
    case 'docx':
      return FileText;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return FileImage;
    case 'mp4':
    case 'webm':
    case 'avi':
    case 'mov':
      return FileVideo;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
      return FileArchive;
    default:
      return File;
  }
}

function getFileSize(fileName: string) {
  // In a real implementation, you might want to store file size in the database
  // For now, we'll just return a placeholder
  return "Unknown size";
}

export function ResourcesPanel({ attachments }: ResourcesPanelProps) {
  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No resources available for this segment.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="text-sm text-muted-foreground mb-6">
        {attachments.length} resource{attachments.length !== 1 ? 's' : ''} available
      </div>
      
      <div className="grid gap-3">
        {attachments.map((attachment) => {
          const FileIcon = getFileIcon(attachment.fileName);
          
          return (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <FileIcon className="h-5 w-5 text-theme-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground truncate">
                    {attachment.fileName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getFileSize(attachment.fileName)}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  // In a real implementation, you'd generate a download URL from the fileKey
                  // For now, we'll just show an alert
                  alert(`Download functionality would be implemented here for ${attachment.fileName}`);
                }}
                className="flex-shrink-0 ml-3 p-2 text-muted-foreground hover:text-theme-600 dark:hover:text-theme-400 hover:bg-theme-50 dark:hover:bg-theme-950/30 rounded-md transition-colors"
                title={`Download ${attachment.fileName}`}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}