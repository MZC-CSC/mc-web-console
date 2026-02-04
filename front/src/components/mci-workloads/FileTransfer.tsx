'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { apiPost } from '@/lib/api/client';
import { OPERATION_IDS } from '@/constants/api';
import { toastSuccess, toastError } from '@/lib/utils/toast';

interface FileTransferProps {
  nsId: string;
  mciId: string;
  subGroupId?: string;
  vmId?: string;
  disabled?: boolean;
}

/**
 * File Transfer Component
 *
 * VM에 파일을 전송하는 컴포넌트
 * - 허용 파일: .txt, .json, .yaml, .conf, .log, .sh
 * - 최대 크기: 10MB
 */
export function FileTransfer({ nsId, mciId, subGroupId, vmId, disabled = false }: FileTransferProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [targetPath, setTargetPath] = useState('/tmp/');

  /**
   * 파일 유효성 검사
   */
  const validator = useCallback((file: File) => {
    console.log('Validating file:', file.name, 'type:', file.type, 'size:', file.size);

    // 파일 크기 체크 (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        code: 'file-too-large',
        message: 'File size exceeds 10MB',
      };
    }

    // 파일 확장자 체크
    const allowedExtensions = ['.txt', '.json', '.yaml', '.yml', '.conf', '.log', '.sh'];
    const hasValidExtension = allowedExtensions.some(ext => file.name?.toLowerCase().endsWith(ext));

    if (!file.name || !hasValidExtension) {
      return {
        code: 'invalid-extension',
        message: 'Only .txt, .json, .yaml, .conf, .log, .sh files are allowed',
      };
    }

    return null;
  }, []);

  /**
   * 파일 드롭 처리
   */
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('=== onDrop called ===');
    console.log('Accepted files:', acceptedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
    console.log('Rejected files:', rejectedFiles);

    if (rejectedFiles.length > 0) {
      console.error('Rejected files details:', rejectedFiles.map((r: any) => ({
        file: r.file.name,
        type: r.file.type,
        errors: r.errors,
      })));

      const errorMessages = rejectedFiles.map((r: any) => {
        const errors = r.errors.map((e: any) => e.message).join(', ');
        return `${r.file.name}: ${errors}`;
      }).join('\n');

      toastError(`File validation failed:\n${errorMessages}`);
    }

    if (acceptedFiles.length === 0) {
      console.warn('No accepted files to process');
      return;
    }

    setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  /**
   * react-dropzone 설정
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    validator,
    multiple: true,
    disabled: disabled || isTransferring,
    noClick: false,
    noKeyboard: false,
  });

  /**
   * 파일 제거
   */
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * 파일 전송
   */
  const handleTransfer = async () => {
    if (uploadedFiles.length === 0) {
      toastError('No files to transfer');
      return;
    }

    if (!targetPath || targetPath.trim() === '') {
      toastError('Please enter target path');
      return;
    }

    setIsTransferring(true);

    try {
      let successCount = 0;
      let failCount = 0;

      for (const file of uploadedFiles) {
        try {
          // FormData 생성
          const formData = new FormData();
          formData.append('file', file);
          formData.append('path', targetPath);

          // queryParams 구성
          const queryParams: Record<string, string> = {};
          if (subGroupId) queryParams.subGroupId = subGroupId;
          if (vmId) queryParams.vmId = vmId;

          console.log('Transferring file:', {
            fileName: file.name,
            nsId,
            mciId,
            targetPath,
            queryParams
          });

          // API 호출 (multipart/form-data)
          const result = await apiPost(OPERATION_IDS.POST_FILE_TO_MCI, {
            pathParams: { nsId, mciId },
            queryParams,
            formData, // FormData 전달
          });

          console.log('Transfer result:', result);
          successCount++;
        } catch (error) {
          console.error('Failed to transfer file:', file.name, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toastSuccess(`Successfully transferred ${successCount} file(s)`);
        setUploadedFiles([]);
      }

      if (failCount > 0) {
        toastError(`Failed to transfer ${failCount} file(s)`);
      }
    } catch (error) {
      console.error('File transfer error:', error);
      toastError('Failed to transfer files');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="w-full border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium">File Transfer</h3>
          <p className="text-xs text-muted-foreground">Transfer files to VM (Max 10MB)</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Target Path Input */}
        <div>
          <Label htmlFor="target-path">Target Path</Label>
          <Input
            id="target-path"
            type="text"
            value={targetPath}
            onChange={(e) => setTargetPath(e.target.value)}
            placeholder="/tmp/"
            disabled={isTransferring || disabled}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Directory path where the file will be stored
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps({
            onClick: (e) => {
              console.log('Dropzone getRootProps onClick called!', e);
            }
          })}
          data-testid="file-dropzone"
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-border hover:border-primary hover:bg-accent/50'
            }
            ${disabled || isTransferring ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className={`mx-auto h-10 w-10 mb-3 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-sm font-medium mb-1">
            {isDragActive ? 'Drop files here' : 'Drop files or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground">
            Allowed: .txt, .json, .yaml, .conf, .log, .sh (Max 10MB each)
          </p>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Files to Transfer:</p>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={isTransferring}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Transfer Button */}
        <Button
          className="w-full"
          onClick={handleTransfer}
          disabled={uploadedFiles.length === 0 || isTransferring || disabled || !targetPath}
        >
          {isTransferring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transferring...
            </>
          ) : (
            'Transfer File'
          )}
        </Button>
      </div>
    </div>
  );
}
