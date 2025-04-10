'use client'

import { generatePoemFromPhoto } from "@/ai/flows/generate-poem-from-photo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ArrowUp, FileText, ImagePlus } from "lucide-react";

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generatePoem = async () => {
    if (!photo) return;

    setLoading(true);
    try {
      const result = await generatePoemFromPhoto({ photoUrl: photo });
      setPoem(result.poem);
    } catch (error) {
      console.error("Poem generation failed:", error);
      setPoem("Failed to generate poem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const savePoem = () => {
    if (!poem) return;

    const blob = new Blob([poem], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "poem.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <Card className="w-full max-w-3xl bg-card shadow-md rounded-xl overflow-hidden">
        <CardHeader className="flex flex-col items-start space-y-2 pb-4 pt-6 pl-8 pr-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Photo Poet</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Unleash the verse within your photos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer bg-accent hover:bg-secondary"
              >
                {photo ? (
                  <img src={photo} alt="Uploaded" className="object-contain max-h-full rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImagePlus className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG, or GIF</p>
                  </div>
                )}
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            <div className="flex-1">
              <Textarea
                placeholder="Generated Poem"
                value={poem || ""}
                readOnly
                className="w-full h-64 bg-muted text-foreground rounded-xl resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="default" onClick={generatePoem} disabled={!photo || loading}>
              {loading ? "Generating..." : <>Generate Poem <ArrowUp className="ml-2 h-4 w-4" /></>}
            </Button>
            {poem && (
              <Button variant="secondary" onClick={savePoem}>
                Save Poem <FileText className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
