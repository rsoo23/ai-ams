"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFile, streamPDF } from "@/api/upload-file";
import ExtractedResultCard from "./_components/extracted-result-card";
import UploadCard from "./_components/upload-card";

interface UploadResponse {
  s3_key: string;
  data: string;
}

export default function UploadPage() {
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [s3Key, setS3Key] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data: UploadResponse) => {
      toast.success("Document uploaded and processed successfully!");
      setUploadResponse(data);
      setS3Key(data.s3_key);
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
    },
  });

  const { mutate: downloadPDF } = useMutation({
    mutationFn: async (s3Key: string) => {
      return streamPDF(s3Key, (progress) => {
        console.log(`Download progress: ${progress.toFixed(1)}%`);
      });
    },
    onSuccess: ({ url, blob, size }) => {
      // Use the PDF URL to display in iframe or embed
      setPdfUrl(url);
      console.log(`PDF downloaded: ${size} bytes`);
    }
  });

  useEffect(() => {
    if (s3Key) {
      downloadPDF(s3Key);
    }
  }, [s3Key, downloadPDF]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <UploadCard 
        mutate={mutate} 
        isPending={isPending} 
        pdfUrl={pdfUrl}
        setPdfUrl={setPdfUrl}
      />
      <ExtractedResultCard 
        uploadResponse={uploadResponse}
        pdfUrl={pdfUrl}
      />
    </div>
  );
}
