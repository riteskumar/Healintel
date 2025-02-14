import React, { ChangeEvent, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Props = {
    onReportConfirmation:(data:string)=> void

    
};

const ReportComponent = ({onReportConfirmation}: Props) => {
  const { toast } = useToast();
  const [base64Data, setbase64Data] = useState("");
  const [reportData, setreportData] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  function handleReportSelection(event: ChangeEvent<HTMLInputElement>): void {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file) {
      let isValidImage = false;
      let isValidDoc = false;

      const validImages = ["image/jpeg", "image/png", "image/webp"];
      const validDocs = ["application/pdf"];
      if (validImages.includes(file.type)) {
        isValidImage = true;
      }
      if (validDocs.includes(file.type)) {
        isValidDoc = true;
      }
      if (!(isValidDoc || isValidImage)) {
        toast({
          description:
            "File is not supported. Please try another file e.g .pdf or .jpeg",
          variant: "destructive",
        });
        return;
      }

      if (isValidDoc) {
        const reader = new FileReader();
        reader.onload = () => {
          const fileContent = reader.result as string;
          //   console.log(fileContent);
          setbase64Data(fileContent);
        };
        reader.readAsDataURL(file);
      }

      if (isValidImage) {
        compressImage(file, (compressedFile: File) => {
          const reader = new FileReader();
          reader.onload = () => {
            const fileContent = reader.result as string;
            // console.log(fileContent);
            setbase64Data(fileContent);
          };
          reader.readAsDataURL(compressedFile);
        });
      }
    }
  }

  async function extractDetails(): Promise<void> {
    if (!base64Data) {
      toast({
        description: "Upload a valid report!",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true)
    const response = await fetch("api/extractreportgemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64: base64Data,
      }),
    });
    if (response.ok) {
      const reportText = await response.text();
      setreportData(reportText);
      setIsLoading(false);
    }
  }

  return (
    <div className="grid w-full items-center gap-6 overflow-auto p-4 pt-0">
      <fieldset className="relative grid gap-6 rounded-lg border p-4">
        <legend className="text-sm font-medium">Report</legend>
        {isLoading && <div className="absolute z-10 h-full w-full bg-card/90 rounded-lg flex flex-row items-center justify-center">
            Please wait...
        </div>}
        <Input type="file" onChange={handleReportSelection} />
        <Button onClick={extractDetails}>1. Upload File</Button>
        <Label>Report summary</Label>
        <Textarea
          placeholder="Extracted data from the report will appear here. Get better recommendations by providing additional patient history and symptoms..."
          className="min-h-72 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
          value={reportData}
          onChange={(e) => {
            setreportData(e.target.value);
          }}
        ></Textarea>
        <Button variant={"destructive"} className="bg-[#D90013]" onClick={()=>{onReportConfirmation(reportData)}} >
          2. Looks Good
        </Button>
      </fieldset>
    </div>
  );
};

export default ReportComponent;
function compressImage(file: File, callback: (compressedFile: File) => void) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set  canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image onto the canvas
      ctx!.drawImage(img, 0, 0);

      // Apply basic compression (adjust quality as needed)
      const quality = 0.1; // Adjust quality as needed

      // Convert canvas to data URL
      const dataURL = canvas.toDataURL("image/jpeg", quality);

      // Convert data URL back to Blob
      const byteString = atob(dataURL.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const compressedFile = new File([ab], file.name, { type: "image/jpeg" });

      callback(compressedFile);
    };
    img.src = e.target!.result as string;
  };

  reader.readAsDataURL(file);
}
