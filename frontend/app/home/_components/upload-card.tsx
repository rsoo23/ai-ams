"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { UseMutateFunction } from "@tanstack/react-query";

interface UploadCardProps {
  mutate: UseMutateFunction<any, any, File, unknown>;
  isPending: boolean;
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
}

export default function UploadCard({ mutate, isPending, pdfUrl, setPdfUrl }: UploadCardProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (acceptedFiles.length !== 1) {
      if (fileRejections.length > 0) {
        const reason = fileRejections[0]?.errors[0]?.message || "Invalid file.";
        toast.error(reason);
      }
      return;
    }
    const file = acceptedFiles[0];
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setPdfFile(file);
  }, [setPdfUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleClear = () => {
    setPdfUrl(null);
    setPdfFile(null);
  };

  const handleUpload = () => {
    if (pdfFile) {
      mutate(pdfFile);
    }
  };

  return (
    <Card className="w-full">
        <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>Upload your invoice / receipt documents here for extraction</CardDescription>
        </CardHeader>
        <CardContent>
            {!pdfUrl && (
            <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-400 rounded-lg p-8 w-full text-center cursor-pointer hover:border-blue-400 transition"
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                <p>Drop the files here ...</p>
                ) : (
                <p>Drag & drop your PDF here, or click to select a file (PDF, max 5MB)</p>
                )}
            </div>
            )}
            {pdfUrl && (
            <iframe
                src={pdfUrl}
                className="w-full h-[600px] border"
            />
            )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            {pdfUrl && (
              <Button className="w-fit" disabled={isPending} variant="destructive" onClick={handleClear}>Clear</Button>
            )}
            <Button className="w-fit" disabled={!pdfFile || isPending} onClick={handleUpload}>Upload</Button>
        </CardFooter>
    </Card>
  );
}