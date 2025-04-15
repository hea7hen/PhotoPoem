'use client'

import { generatePoemFromPhoto } from "@/ai/flows/generate-poem-from-photo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { ArrowUp, FileText, ImagePlus, Share2, Loader2, Heart, Download, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Type for saved poem entries
type SavedPoem = {
  id: string;
  photo: string;
  poem: string;
  date: Date;
};

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [savedPoems, setSavedPoems] = useState<SavedPoem[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Load saved poems from localStorage on component mount
  useEffect(() => {
    const storedPoems = localStorage.getItem('savedPoems');
    if (storedPoems) {
      try {
        // Parse stored poems and convert date strings back to Date objects
        const parsedPoems = JSON.parse(storedPoems);
        setSavedPoems(parsedPoems.map((poem: any) => ({
          ...poem,
          date: new Date(poem.date)
        })));
      } catch (e) {
        console.error("Failed to parse saved poems:", e);
      }
    }
  }, []);

  // Simulated progress updates during loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          // Cap progress at 90% until actual completion
          const nextProgress = prev + (Math.random() * 10);
          return nextProgress > 90 ? 90 : nextProgress;
        });
      }, 500);

      return () => {
        clearInterval(interval);
        // Reset progress when loading is done
        setProgress(0);
      };
    }
  }, [loading]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const generatePoem = async () => {
    if (!photo) return;

    setLoading(true);
    setProgress(10); // Start progress
    
    try {
      const result = await generatePoemFromPhoto({ photoUrl: photo });
      setPoem(result.poem);
      setProgress(100); // Complete progress
    } catch (error) {
      console.error("Poem generation failed:", error);
      setPoem("Failed to generate poem. Please try again.");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500); // Small delay for smooth transition
    }
  };

  const savePoem = () => {
    if (!poem || !photo) return;

    const newPoem: SavedPoem = {
      id: Date.now().toString(),
      photo,
      poem,
      date: new Date()
    };

    const updatedPoems = [...savedPoems, newPoem];
    setSavedPoems(updatedPoems);
    
    // Save to localStorage
    try {
      localStorage.setItem('savedPoems', JSON.stringify(updatedPoems));
    } catch (e) {
      console.error("Failed to save poems to localStorage:", e);
    }
  };

  const downloadPoem = () => {
    if (!poem) return;

    // Create a combined image and poem
    const textBlob = new Blob([poem], { type: "text/plain" });
    const url = URL.createObjectURL(textBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "poem.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sharePoem = async () => {
    if (!poem || !photo) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Generated Poem',
          text: poem,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(poem);
      alert('Poem copied to clipboard!');
    }
  };

  const deletePoem = (id: string) => {
    const updatedPoems = savedPoems.filter(poem => poem.id !== id);
    setSavedPoems(updatedPoems);
    localStorage.setItem('savedPoems', JSON.stringify(updatedPoems));
  };

  const resetCanvas = () => {
    setPhoto(null);
    setPoem(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background">
      <Card className="w-full max-w-4xl bg-card shadow-md rounded-xl overflow-hidden">
        <CardHeader className="flex flex-col items-start space-y-2 pb-4 pt-6 pl-8 pr-8">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Photo Poet</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Unleash the verse within your photos.
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="create" className="w-full">
          <div className="px-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="gallery">Gallery {savedPoems.length > 0 && `(${savedPoems.length})`}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create">
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div
                    className={cn(
                      "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300",
                      dragActive ? "border-primary bg-primary/10" : "border-accent bg-accent hover:bg-accent/50",
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {photo ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={photo} 
                          alt="Uploaded" 
                          className="object-contain w-full h-full rounded-xl" 
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 w-8 h-8" 
                          onClick={(e) => {
                            e.stopPropagation();
                            resetCanvas();
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="photo-upload"
                        className="flex flex-col items-center justify-center w-full h-full"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImagePlus className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">SVG, PNG, JPG, or GIF</p>
                        </div>
                      </label>
                    )}
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="relative w-full h-64">
                    <Textarea
                      placeholder="Your poem will appear here..."
                      value={poem || ""}
                      readOnly
                      className="w-full h-full bg-muted text-foreground rounded-xl resize-none p-4 font-serif"
                    />
                    {loading && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Crafting your poem...</p>
                        <Progress value={progress} className="w-3/4 mt-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-between">
                <Button 
                  variant="default" 
                  onClick={generatePoem} 
                  disabled={!photo || loading}
                  className="min-w-28"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate Poem <ArrowUp className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
                
                {poem && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={savePoem}>
                      <Heart className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={downloadPoem}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={sharePoem}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="gallery">
            <CardContent className="p-8">
              {savedPoems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No saved poems yet. Create one first!</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid gap-4 grid-cols-1">
                    {savedPoems.map((savedPoem) => (
                      <div key={savedPoem.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl">
                        <div className="w-full md:w-1/3">
                          <img 
                            src={savedPoem.photo} 
                            alt="Saved photo" 
                            className="w-full h-40 object-cover rounded-lg" 
                          />
                        </div>
                        <div className="flex flex-col flex-1 justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {savedPoem.date.toLocaleString()}
                            </p>
                            <div className="font-serif">{savedPoem.poem}</div>
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => deletePoem(savedPoem.id)}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
