import React, { useState } from "react";
import { toast } from "sonner";
import UploadFormInput from "./UploadFormInput";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import ProcessingStatus from "./ProcessingStatus";

function UploadForm() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('uploading');
  const [selectedEngine, setSelectedEngine] = useState('gemini');
  const [selectedStyle, setSelectedStyle] = useState('concise');
  const GO_BACKEND_URL = "http://localhost:8081";

  const handleSubmit = async (response) => {
    if (!response || response.length === 0) {
      toast.error("Upload failed or no response received.");
      setIsProcessing(false);
      return;
    }

    if (!user) {
      toast.error("You must be logged in to summarize PDFs.");
      setIsProcessing(false);
      return;
    }

    const uploadedFile = response[0];
    const fileUrl = uploadedFile.ufsUrl || uploadedFile.url || uploadedFile.serverData?.fileUrl;
    const fileName = uploadedFile.name;

    if (!fileUrl) {
      toast.error("Server processing failed. Please try again.");
      setIsProcessing(false);
      return;
    }

    try {
      setCurrentStep('summarizing');

      const summarizeResponse = await fetch(`${GO_BACKEND_URL}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          file_url: fileUrl,
          file_name: fileName,
          provider: selectedEngine,
          style: selectedStyle, // Send selected style
        }),
      });

      if (summarizeResponse.ok) {
        setCurrentStep('saving');
        const result = await summarizeResponse.json();

        if (!result || !result.id) {
          console.error("Invalid response from backend: missing id", result);
          toast.error("Server error: Invalid response from backend");
          setIsProcessing(false);
          return;
        }

        setTimeout(() => {
          setIsProcessing(false);
          toast.success("Summary generated and saved!");
          navigate(`/summaries/${result.id}`);
        }, 1000);
      } else {
        const errData = await summarizeResponse.json();
        const errorMessage = errData.error || "Summarization failed.";

        if (errorMessage.includes("ollama connection failed")) {
          toast.error("Ollama not found!", {
            description: "Please make sure Ollama is installed and running on your machine.",
            duration: 10000,
          });
        } else {
          toast.error(errorMessage);
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Summarization error:", error);
      toast.error("Could not reach Go Backend for processing.");
      setIsProcessing(false);
    }
  };

  const beforeUpload = (files) => {
    if (files.some(f => f.size > 32 * 1024 * 1024)) {
      toast.error("Each file must be less than 32MB.");
      return [];
    }
    return files;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto items-center">
      <ProcessingStatus isVisible={isProcessing} currentStep={currentStep} />

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-rose-100 w-full group transition-all hover:shadow-rose-100/50">
        <UploadFormInput
          beforeUpload={beforeUpload}
          handleSubmit={handleSubmit}
          setIsProcessing={setIsProcessing}
          setCurrentStep={setCurrentStep}
          selectedEngine={selectedEngine}
          setSelectedEngine={setSelectedEngine}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
        />
      </div>

      <p className="text-slate-500 text-sm font-medium animate-pulse">
        ⚡ Supercharged by Go Language & Gemini AI ⚡
      </p>
    </div>
  );
}

export default UploadForm;
