"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Globe,
  ImageIcon,
  Upload,
  X,
  Loader2,
  ArrowRight,
  FileSearch,
  Check,
  AlertCircle,
  Figma,
  Key,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

type AuditType = "url" | "image" | "full" | "figma";

const auditSchema = z.object({
  name: z.string().min(3, "Audit name must be at least 3 characters"),
  description: z.string().optional(),
  target_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  device_type: z.enum(["desktop", "mobile", "tablet"]).default("desktop"),
});

type AuditFormData = z.infer<typeof auditSchema>;

interface UploadedFile {
  file: File;
  preview: string;
}

export function NewAuditForm() {
  const router = useRouter();
  const supabase = createClient();
  const [auditType, setAuditType] = useState<AuditType>("image");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"type" | "details" | "upload">("type");
  const [figmaToken, setFigmaToken] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema),
    defaultValues: { device_type: "desktop" },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 5)
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  function removeFile(index: number) {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  async function onSubmit(data: AuditFormData) {
    if (auditType === "image" && uploadedFiles.length === 0) {
      toast.error("Please upload at least one screenshot");
      return;
    }
    if ((auditType === "url" || auditType === "full") && !data.target_url) {
      toast.error("Please enter the target URL");
      return;
    }
    if (auditType === "figma" && !data.target_url) {
      toast.error("Please enter your Figma file URL");
      return;
    }
    if (auditType === "figma" && !figmaToken) {
      toast.error("Please enter your Figma personal access token");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // 1. Create audit record
      const { data: audit, error: auditError } = await supabase
        .from("audits")
        .insert({
          created_by: user.id,
          name: data.name,
          description: data.description ?? null,
          target_url: data.target_url || null,
          audit_type: auditType,
          device_type: data.device_type,
          status: "draft",
          findings_count: 0,
          critical_count: 0,
          high_count: 0,
          medium_count: 0,
          low_count: 0,
        })
        .select()
        .single();

      if (auditError || !audit) {
        throw new Error(auditError?.message ?? "Failed to create audit");
      }

      // 2a. If Figma audit — fetch frame images and upload to Supabase storage
      let figmaImageUrls: string[] = [];
      if (auditType === "figma" && data.target_url) {
        const figmaRes = await fetch("/api/figma", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figma_url: data.target_url,
            figma_token: figmaToken,
            audit_id: audit.id,
            user_id: user.id,
          }),
        });
        if (!figmaRes.ok) {
          const err = await figmaRes.json();
          throw new Error(err.error ?? "Failed to fetch Figma frames");
        }
        const figmaData = await figmaRes.json();
        figmaImageUrls = figmaData.image_urls ?? [];
        if (figmaImageUrls.length === 0) throw new Error("No frames found in Figma file");
      }

      // 2b. Upload screenshots if image audit
      const uploadedUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        for (const [idx, uploadedFile] of uploadedFiles.entries()) {
          const ext = uploadedFile.file.name.split(".").pop() ?? "png";
          const path = `${user.id}/${audit.id}/screenshot_${idx + 1}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("audit-screenshots")
            .upload(path, uploadedFile.file, { upsert: true });

          if (uploadError) {
            throw new Error(`Failed to upload screenshot "${uploadedFile.file.name}": ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("audit-screenshots")
            .getPublicUrl(path);

          uploadedUrls.push(publicUrl);

          await supabase.from("audit_screenshots").insert({
            audit_id: audit.id,
            url: publicUrl,
            filename: uploadedFile.file.name,
            file_size: uploadedFile.file.size,
            order_index: idx,
            annotations: [],
          });
        }
      }

      // Guard: image audit must have at least one uploaded URL
      if ((auditType === "image") && uploadedUrls.length === 0) {
        throw new Error("No screenshots were uploaded successfully. Please try again.");
      }

      // 3. Start AI analysis
      await supabase.from("audits").update({ status: "ai_analyzing" }).eq("id", audit.id);

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_id: audit.id,
          audit_type: auditType,
          image_urls: auditType === "figma" ? figmaImageUrls : uploadedUrls,
          target_url: data.target_url || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "AI analysis failed");
      }

      toast.success("Audit created!", {
        description: "AI analysis is running. You can review findings in the audit workspace.",
      });

      router.push(`/audits/${audit.id}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to create audit", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Audit Type Selection */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">What would you like to audit?</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              type: "image" as AuditType,
              icon: ImageIcon,
              label: "Screenshots",
              desc: "Upload UI screenshots for AI visual analysis",
            },
            {
              type: "url" as AuditType,
              icon: Globe,
              label: "Website URL",
              desc: "Analyze a live website — auto screenshots",
            },
            {
              type: "figma" as AuditType,
              icon: Figma,
              label: "Figma Design",
              desc: "Audit designs before development",
            },
            {
              type: "full" as AuditType,
              icon: FileSearch,
              label: "Full Audit",
              desc: "Screenshots + URL for comprehensive coverage",
            },
          ].map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => setAuditType(option.type)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all space-y-2",
                auditType === option.type
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              <div className="flex items-center justify-between">
                <option.icon
                  className={cn(
                    "h-5 w-5",
                    auditType === option.type ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {auditType === option.type && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <p className={cn(
                  "text-sm font-semibold",
                  auditType === option.type ? "text-primary" : ""
                )}>
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Audit Details */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">Audit Details</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Audit name *</label>
          <input
            placeholder="e.g. Homepage Checkout Flow Review"
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border bg-background text-sm",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              errors.name ? "border-destructive" : "border-input"
            )}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={2}
            placeholder="What are you evaluating? Any specific concerns or focus areas?"
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border bg-background text-sm resize-none",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              "border-input"
            )}
            {...register("description")}
          />
        </div>

        {(auditType === "url" || auditType === "full") && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Target URL *</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="url"
                placeholder="https://yourproduct.com"
                className={cn(
                  "w-full pl-9 pr-4 py-2.5 rounded-lg border bg-background text-sm",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.target_url ? "border-destructive" : "border-input"
                )}
                {...register("target_url")}
              />
            </div>
            {errors.target_url && <p className="text-xs text-destructive">{errors.target_url.message}</p>}
            <p className="text-xs text-muted-foreground">A screenshot will be captured automatically for visual annotation</p>
          </div>
        )}

        {auditType === "figma" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Figma File URL *</label>
              <div className="relative">
                <Figma className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="https://www.figma.com/file/ABC123/MyDesign"
                  className={cn(
                    "w-full pl-9 pr-4 py-2.5 rounded-lg border bg-background text-sm",
                    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    errors.target_url ? "border-destructive" : "border-input"
                  )}
                  {...register("target_url")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Figma Personal Access Token *</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="figd_…"
                  value={figmaToken}
                  onChange={(e) => setFigmaToken(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Get your token at figma.com → Account Settings → Personal Access Tokens
              </p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
              <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">What happens:</p>
              <ul className="text-xs text-violet-600 dark:text-violet-400 mt-1 space-y-0.5 list-disc list-inside">
                <li>We fetch your Figma frames as images (up to 6 frames)</li>
                <li>GPT-4o Vision analyzes each frame against 153 UX checks</li>
                <li>Findings are highlighted on each frame with visual markers</li>
              </ul>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Device type</label>
          <div className="flex gap-2">
            {["desktop", "mobile", "tablet"].map((device) => (
              <label key={device} className="flex-1">
                <input
                  type="radio"
                  value={device}
                  className="sr-only"
                  {...register("device_type")}
                />
                <div className={cn(
                  "px-3 py-2 rounded-lg border text-sm text-center cursor-pointer capitalize transition-all",
                  "hover:border-primary/50"
                )}>
                  {device}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Image Upload */}
      {(auditType === "image" || auditType === "full") && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Upload Screenshots</h2>
            <span className="text-xs text-muted-foreground">
              {uploadedFiles.length}/5 files
            </span>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">
              {isDragActive ? "Drop screenshots here…" : "Drag & drop screenshots here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to select files · PNG, JPG, WebP · max 10MB each · up to 5 files
            </p>
          </div>

          {/* File previews */}
          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-16 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className={cn(
                      "absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white",
                      "flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">
                    {file.file.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Info */}
      <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-sm">🤖</span>
          </div>
          <div>
            <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
              AI Analysis will run automatically
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-300 mt-1">
              GPT-4o Vision will evaluate your UI against all 153 checks across 12 heuristic categories.
              Analysis takes 30–60 seconds. You can then review, edit, and verify each finding.
            </p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
          "bg-primary text-primary-foreground font-medium",
          "hover:opacity-90 active:scale-[0.98] transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating audit & running AI analysis…
          </>
        ) : (
          <>
            Run AI Audit
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
