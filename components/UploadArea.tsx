'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UploadArea() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Please upload only JSON files from your Google Takeout');
      return;
    }

    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // This is a placeholder for the actual upload logic
      // In a real implementation, you would use UploadThing or similar
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(((i + 1) / files.length) * 100);
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Reset after successful upload
      setFiles([]);
      setUploading(false);
      setUploadProgress(0);
    } catch (err) {
      setError('Failed to upload files. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              "hover:border-primary hover:bg-primary/5"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? "Drop your files here" : "Upload your YouTube Music data"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag & drop your Google Takeout JSON files here, or click to browse
            </p>
            <Button variant="outline" type="button">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">Selected Files ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading files...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Upload Button */}
            {!uploading && (
              <Button onClick={uploadFiles} className="w-full mt-4" disabled={files.length === 0}>
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">How to get your YouTube Music data:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://takeout.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Takeout</a></li>
            <li>Select "YouTube and YouTube Music"</li>
            <li>Choose "history" in the format options</li>
            <li>Download and extract the files</li>
            <li>Upload the watch-history.json file(s) here</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}