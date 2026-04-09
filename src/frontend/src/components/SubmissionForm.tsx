import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ChevronRight, Gem, ImagePlus, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ExternalBlob,
  Furnishing,
  PropertyCategory,
  Representation,
  TargetBuyer,
  createActor,
} from "../backend";
import type { PropertyFormData, UploadedPhoto } from "../types";

const PF = { fontFamily: "'Inter', sans-serif" } as const;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE_MB = 5;
const MAX_PHOTOS = 3;

// ── Section wrapper ──────────────────────────────────────────────────────────
function FormSection({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-xl p-6 sm:p-8 space-y-6"
      style={{
        border: "1px solid oklch(0.74 0.13 75 / 0.42)",
        boxShadow:
          "0 2px 8px oklch(0.74 0.13 75 / 0.10), 0 8px 32px oklch(0.74 0.13 75 / 0.06)",
      }}
    >
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{
              ...PF,
              fontSize: "13px",
              fontWeight: 700,
              background: "oklch(0.35 0.30 305)",
              border: "1.5px solid oklch(0.74 0.13 75 / 0.55)",
              boxShadow: "0 0 0 3px oklch(0.35 0.30 305 / 0.12)",
            }}
          >
            {number}
          </span>
          <h2
            style={{
              ...PF,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color: "oklch(0.35 0.30 305)",
            }}
          >
            {title}
          </h2>
        </div>
        <div className="gold-divider" />
      </div>
      {children}
    </div>
  );
}

// ── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label
        style={{
          ...PF,
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.20em",
          textTransform: "uppercase",
          color: "oklch(0.16 0.02 305)",
        }}
      >
        {label}
      </Label>
      {children}
      {error && (
        <p style={{ ...PF, color: "oklch(0.55 0.22 25)", fontSize: "11px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Photo Upload ─────────────────────────────────────────────────────────────
function PhotoUploadSection({
  photos,
  onAdd,
  onRemove,
}: {
  photos: UploadedPhoto[];
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAdd = photos.length < MAX_PHOTOS;

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) onAdd(e.dataTransfer.files);
    },
    [onAdd],
  );

  return (
    <Field label="Property Photos (Optional — up to 3 images, 5 MB each)">
      <div className="space-y-3">
        {/* Dropzone */}
        {canAdd && (
          <button
            type="button"
            tabIndex={0}
            aria-label="Upload property photos"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="transition-smooth cursor-pointer w-full text-left"
            style={{
              border: "1.5px dashed oklch(0.74 0.13 75 / 0.65)",
              borderRadius: "0.5rem",
              padding: "1.25rem 1rem",
              background: "oklch(0.975 0.010 305 / 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              color: "oklch(0.50 0.05 305)",
            }}
            data-ocid="photo-upload-dropzone"
          >
            <ImagePlus
              className="w-6 h-6"
              style={{ color: "oklch(0.60 0.15 75)" }}
            />
            <p style={{ ...PF, fontSize: "12px", letterSpacing: "0.04em" }}>
              Tap to select or drag &amp; drop — JPG, PNG or GIF
            </p>
            <p
              style={{
                ...PF,
                fontSize: "11px",
                color: "oklch(0.60 0.15 75)",
              }}
            >
              Max {MAX_FILE_SIZE_MB} MB each · {MAX_PHOTOS - photos.length} slot
              {MAX_PHOTOS - photos.length !== 1 ? "s" : ""} remaining
            </p>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0)
              onAdd(e.target.files);
            e.target.value = "";
          }}
          data-ocid="photo-upload-input"
        />

        {/* Thumbnails */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative rounded-lg overflow-hidden"
                style={{
                  border: "1px solid oklch(0.74 0.13 75 / 0.40)",
                  background: "oklch(0.97 0.004 90)",
                  aspectRatio: "1 / 1",
                }}
              >
                {/* Thumbnail image */}
                <img
                  src={photo.previewUrl}
                  alt={photo.file.name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay: progress or error */}
                {photo.status === "uploading" && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                    style={{ background: "oklch(0.20 0.02 305 / 0.65)" }}
                  >
                    <p
                      style={{
                        ...PF,
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#fff",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {photo.progress}%
                    </p>
                    <div
                      style={{
                        width: "60%",
                        height: "4px",
                        borderRadius: "2px",
                        background: "oklch(0.74 0.13 75 / 0.35)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${photo.progress}%`,
                          background: "oklch(0.74 0.13 75)",
                          borderRadius: "2px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                )}
                {photo.status === "error" && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "oklch(0.55 0.22 25 / 0.75)" }}
                  >
                    <p
                      style={{
                        ...PF,
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "#fff",
                        padding: "0 4px",
                        textAlign: "center",
                      }}
                    >
                      Upload failed
                    </p>
                  </div>
                )}

                {/* File name below */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-1.5 py-1"
                  style={{
                    background: "oklch(0.10 0.02 305 / 0.70)",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <p
                    className="truncate"
                    style={{
                      ...PF,
                      fontSize: "9px",
                      color: "#fff",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {photo.file.name}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  aria-label={`Remove ${photo.file.name}`}
                  onClick={() => onRemove(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-smooth hover:opacity-80"
                  style={{
                    background: "oklch(0.35 0.30 305)",
                    border: "1px solid oklch(0.74 0.13 75 / 0.50)",
                  }}
                  data-ocid={`btn-remove-photo-${photo.id}`}
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Field>
  );
}

// ── Success State ────────────────────────────────────────────────────────────
function SuccessState() {
  return (
    <div
      className="bg-white rounded-xl p-10 sm:p-16 text-center space-y-7"
      style={{
        border: "1.5px solid oklch(0.74 0.13 75 / 0.60)",
        boxShadow:
          "0 4px 24px oklch(0.74 0.13 75 / 0.18), 0 1px 4px oklch(0.74 0.13 75 / 0.10)",
      }}
    >
      <div className="flex justify-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "oklch(0.93 0.04 305)",
            border: "1.5px solid oklch(0.74 0.13 75 / 0.55)",
            boxShadow: "0 0 0 6px oklch(0.74 0.13 75 / 0.10)",
          }}
        >
          <CheckCircle2
            className="w-10 h-10"
            style={{ color: "oklch(0.35 0.30 305)" }}
          />
        </div>
      </div>
      <div className="space-y-4">
        <h2
          style={{
            ...PF,
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontStyle: "italic",
            letterSpacing: "0.01em",
            color: "oklch(0.35 0.30 305)",
          }}
        >
          Submission Received
        </h2>
        <div className="gold-divider max-w-xs mx-auto" />
        <p
          style={{
            ...PF,
            fontWeight: 400,
            fontSize: "15px",
            letterSpacing: "0.03em",
            lineHeight: 1.7,
            color: "oklch(0.50 0.05 305)",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          Thank you — your listing has been submitted for review. Our team will
          contact you shortly.
        </p>
      </div>
      <div
        className="inline-flex items-center gap-2"
        style={{
          ...PF,
          fontSize: "10px",
          letterSpacing: "0.30em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: "oklch(0.60 0.15 75)",
        }}
      >
        <Gem className="w-3 h-3" />
        <span>Club Invest Gurgaon · Private &amp; Curated</span>
        <Gem className="w-3 h-3" />
      </div>
    </div>
  );
}

// ── Simulated upload: generates fake progress then resolves ───────────────
function simulateUpload(
  photo: UploadedPhoto,
  onProgress: (id: string, progress: number) => void,
  onDone: (id: string, url: string) => void,
): void {
  let current = 0;
  const tick = () => {
    current += Math.floor(Math.random() * 18) + 8;
    if (current >= 100) {
      onProgress(photo.id, 100);
      // Use the object URL as the "uploaded" URL (local only)
      setTimeout(() => onDone(photo.id, photo.previewUrl), 200);
    } else {
      onProgress(photo.id, current);
      setTimeout(tick, 150 + Math.random() * 100);
    }
  };
  setTimeout(tick, 120);
}

// ── Main Form ────────────────────────────────────────────────────────────────
export default function SubmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  const { register, handleSubmit, setValue, watch } = useForm<PropertyFormData>(
    {
      mode: "onChange",
      defaultValues: {
        representation: "self",
        propertyCategory: "residential",
        furnishing: "unfurnished",
        targetBuyer: "investor",
        negotiable: false,
        authorized: false,
      },
    },
  );

  const authorized = watch("authorized");
  const negotiable = watch("negotiable");

  const anyUploading = photos.some((p) => p.status === "uploading");

  const handleAddPhotos = useCallback(
    (files: FileList) => {
      const remaining = MAX_PHOTOS - photos.length;
      if (remaining <= 0) return;

      const toAdd = Array.from(files).slice(0, remaining);
      const validated: UploadedPhoto[] = [];

      for (const file of toAdd) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(
            `${file.name}: Only JPG, PNG, or GIF files are accepted.`,
          );
          continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          toast.error(
            `${file.name}: File exceeds ${MAX_FILE_SIZE_MB} MB limit.`,
          );
          continue;
        }
        validated.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          status: "uploading",
        });
      }

      if (validated.length === 0) return;

      setPhotos((prev) => [...prev, ...validated]);

      for (const photo of validated) {
        simulateUpload(
          photo,
          (id, progress) =>
            setPhotos((prev) =>
              prev.map((p) => (p.id === id ? { ...p, progress } : p)),
            ),
          (id, url) =>
            setPhotos((prev) =>
              prev.map((p) =>
                p.id === id
                  ? { ...p, status: "done", uploadedUrl: url, progress: 100 }
                  : p,
              ),
            ),
        );
      }
    },
    [photos.length],
  );

  const handleRemovePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const onSubmit = async (data: PropertyFormData) => {
    if (anyUploading) {
      toast.error("Please wait for all photo uploads to complete.");
      return;
    }

    setIsSubmitting(true);
    try {
      const representationMap: Record<string, Representation> = {
        self: Representation.Owner,
        agent: Representation.Broker,
        poa: Representation.ChannelPartner,
      };
      const categoryMap: Record<string, PropertyCategory> = {
        residential: PropertyCategory.Apartment,
        commercial: PropertyCategory.Commercial,
        villa: PropertyCategory.Villa,
        penthouse: PropertyCategory.BuilderFloor,
        plot: PropertyCategory.Plot,
      };
      const furnishingMap: Record<string, Furnishing> = {
        "fully-furnished": Furnishing.Furnished,
        "semi-furnished": Furnishing.SemiFurnished,
        unfurnished: Furnishing.Unfurnished,
      };
      const buyerMap: Record<string, TargetBuyer> = {
        investor: TargetBuyer.Investor,
        end_user: TargetBuyer.EndUser,
        premium: TargetBuyer.PremiumBuyer,
      };

      const photoUrls = photos
        .filter((p) => p.status === "done" && p.uploadedUrl)
        .map((p) => p.uploadedUrl as string);

      const uniqueFeaturesWithPhotos =
        photoUrls.length > 0
          ? `${data.uniqueFeatures ?? ""}\n\nPhoto URLs:\n${photoUrls.join("\n")}`.trim()
          : (data.uniqueFeatures ?? "");

      const submission = {
        clientName: data.clientName ?? "",
        contactNumber: data.contactNumber ?? "",
        email: data.email ?? "",
        representation:
          representationMap[data.representation] ?? Representation.Owner,
        propertyCategory:
          categoryMap[data.propertyCategory] ?? PropertyCategory.Apartment,
        projectName: data.projectName ?? "",
        city: data.city ?? "",
        location: data.location ?? "",
        fullAddress: data.fullAddress ?? "",
        area: data.area ?? "",
        configuration: data.configuration ?? "",
        floorDetails: data.floorDetails ?? "",
        furnishing: furnishingMap[data.furnishing] ?? Furnishing.Unfurnished,
        propertyAge: data.propertyAge ?? "",
        askingPrice: data.askingPrice ? String(data.askingPrice) : "",
        priceJustification: data.priceJustification ?? "",
        negotiable: data.negotiable,
        targetBuyer: buyerMap[data.targetBuyer] ?? TargetBuyer.Investor,
        locationAdvantages: data.locationAdvantages ?? "",
        connectivity: data.connectivity ?? "",
        keyHighlights: data.keyHighlights ?? "",
        uniqueFeatures: uniqueFeaturesWithPhotos,
        photoUrls: photoUrls,
        authorized: data.authorized,
        submittedAt: BigInt(Date.now()),
      };

      const canisterId = import.meta.env.VITE_CANISTER_ID_BACKEND as
        | string
        | undefined;
      if (!canisterId) {
        throw new Error(
          "Backend canister not configured. Please try again later.",
        );
      }

      const noopUpload = async (_file: ExternalBlob) => new Uint8Array();
      const noopDownload = async (_file: Uint8Array) =>
        ExternalBlob.fromBytes(new Uint8Array());
      const backend = createActor(canisterId, noopUpload, noopDownload, {
        agentOptions: { host: window.location.origin },
      });

      await backend.submitProperty(submission);

      setSubmitted(true);
      toast.success("Listing submitted successfully");
    } catch (err) {
      console.error("Submission error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Submission failed. Please check your connection and try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) return <SuccessState />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      data-ocid="submission-form"
      noValidate
      style={PF}
    >
      {/* Intro Banner */}
      <div
        className="bg-white rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{
          border: "1px solid oklch(0.74 0.13 75 / 0.55)",
          boxShadow: "0 2px 12px oklch(0.74 0.13 75 / 0.10)",
        }}
      >
        <Gem
          className="w-5 h-5 flex-shrink-0"
          style={{ color: "oklch(0.60 0.15 75)" }}
        />
        <p
          style={{
            ...PF,
            fontWeight: 400,
            fontSize: "14px",
            letterSpacing: "0.03em",
            lineHeight: 1.65,
            color: "oklch(0.50 0.05 305)",
          }}
        >
          Submit your property for a curated listing and private video showcase.{" "}
          <span style={{ fontWeight: 700, color: "oklch(0.55 0.15 70)" }}>
            Minimum property value: ₹2 Cr+
          </span>
          {" | "}
          <span style={{ color: "oklch(0.35 0.30 305)", fontStyle: "italic" }}>
            Standard brokerage: 2%
          </span>
        </p>
      </div>

      {/* ── Section 1: Client Profile ──────────────────────────────────── */}
      <FormSection number={1} title="Client Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full Name">
            <Input
              {...register("clientName")}
              placeholder="e.g., Rahul Sharma"
              className="input-premium w-full"
              data-ocid="input-client-name"
            />
          </Field>
          <Field label="Contact Number">
            <Input
              {...register("contactNumber")}
              placeholder="e.g., 9876543210"
              maxLength={10}
              className="input-premium w-full"
              data-ocid="input-contact-number"
            />
          </Field>
          <Field label="Email Address">
            <Input
              {...register("email")}
              type="email"
              placeholder="e.g., rahul@example.com"
              className="input-premium w-full"
              data-ocid="input-email"
            />
          </Field>
          <Field label="Representation">
            <Select
              defaultValue="self"
              onValueChange={(v) =>
                setValue(
                  "representation",
                  v as PropertyFormData["representation"],
                  { shouldValidate: false },
                )
              }
            >
              <SelectTrigger
                className="input-premium w-full"
                data-ocid="select-representation"
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Owner</SelectItem>
                <SelectItem value="agent">Broker</SelectItem>
                <SelectItem value="poa">Channel Partner</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>

      {/* ── Section 2: Property Type ───────────────────────────────────── */}
      <FormSection number={2} title="Property Type">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Property Category">
            <Select
              defaultValue="residential"
              onValueChange={(v) =>
                setValue(
                  "propertyCategory",
                  v as PropertyFormData["propertyCategory"],
                  { shouldValidate: false },
                )
              }
            >
              <SelectTrigger
                className="input-premium w-full"
                data-ocid="select-property-category"
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Apartment</SelectItem>
                <SelectItem value="penthouse">Builder Floor</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Project / Society Name">
            <Input
              {...register("projectName")}
              placeholder="e.g., DLF Camellias"
              className="input-premium w-full"
              data-ocid="input-project-name"
            />
          </Field>
          <Field label="City">
            <Input
              {...register("city")}
              placeholder="e.g., Gurgaon"
              className="input-premium w-full"
              data-ocid="input-city"
            />
          </Field>
          <Field label="Location / Sector">
            <Input
              {...register("location")}
              placeholder="e.g., Sector 42"
              className="input-premium w-full"
              data-ocid="input-location"
            />
          </Field>
        </div>
        <Field label="Full Address">
          <Textarea
            {...register("fullAddress")}
            placeholder="Complete address including building, floor, wing…"
            rows={3}
            className="input-premium w-full resize-none"
            data-ocid="input-full-address"
          />
        </Field>
      </FormSection>

      {/* ── Section 3: Specifications ──────────────────────────────────── */}
      <FormSection number={3} title="Property Specifications">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Area (sq. ft.)">
            <Input
              {...register("area")}
              placeholder="e.g., 4500 sq. ft."
              className="input-premium w-full"
              data-ocid="input-area"
            />
          </Field>
          <Field label="Configuration (BHK / Layout)">
            <Input
              {...register("configuration")}
              placeholder="e.g., 4 BHK + Staff"
              className="input-premium w-full"
              data-ocid="input-configuration"
            />
          </Field>
          <Field label="Floor Details">
            <Input
              {...register("floorDetails")}
              placeholder="e.g., 12th Floor, Tower B"
              className="input-premium w-full"
              data-ocid="input-floor-details"
            />
          </Field>
          <Field label="Furnishing Status">
            <Select
              defaultValue="unfurnished"
              onValueChange={(v) =>
                setValue("furnishing", v as PropertyFormData["furnishing"], {
                  shouldValidate: false,
                })
              }
            >
              <SelectTrigger
                className="input-premium w-full"
                data-ocid="select-furnishing"
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fully-furnished">Fully Furnished</SelectItem>
                <SelectItem value="semi-furnished">Semi Furnished</SelectItem>
                <SelectItem value="unfurnished">Unfurnished</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Property Age">
            <Input
              {...register("propertyAge")}
              placeholder="e.g., 3 years / New"
              className="input-premium w-full"
              data-ocid="input-property-age"
            />
          </Field>
        </div>

        {/* Photo upload lives at the bottom of Specifications */}
        <PhotoUploadSection
          photos={photos}
          onAdd={handleAddPhotos}
          onRemove={handleRemovePhoto}
        />

        {anyUploading && (
          <p
            style={{
              ...PF,
              fontSize: "11px",
              letterSpacing: "0.04em",
              color: "oklch(0.60 0.15 75)",
              fontStyle: "italic",
            }}
            data-ocid="upload-in-progress-notice"
          >
            ⏳ Upload in progress — submission is locked until all photos
            finish.
          </p>
        )}
      </FormSection>

      {/* ── Section 4: Pricing ─────────────────────────────────────────── */}
      <FormSection number={4} title="Pricing">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Asking Price (₹)">
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  ...PF,
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "oklch(0.60 0.15 75)",
                }}
              >
                ₹
              </span>
              <Input
                {...register("askingPrice", { valueAsNumber: true })}
                type="number"
                placeholder="e.g., 25000000"
                className="input-premium w-full pl-7"
                data-ocid="input-asking-price"
              />
            </div>
            <p
              style={{
                ...PF,
                fontSize: "11px",
                letterSpacing: "0.03em",
                color: "oklch(0.60 0.15 75)",
                marginTop: "4px",
              }}
            >
              Recommended minimum: ₹2,00,00,000 (₹2 Cr)
            </p>
          </Field>
          <Field label="Negotiable">
            <RadioGroup
              value={negotiable ? "yes" : "no"}
              onValueChange={(v) =>
                setValue("negotiable", v === "yes", { shouldValidate: false })
              }
              className="flex items-center gap-6 pt-2"
              data-ocid="radio-negotiable"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="yes"
                  id="neg-yes"
                  className="border-primary text-primary"
                />
                <Label
                  htmlFor="neg-yes"
                  style={{
                    ...PF,
                    fontSize: "13px",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                  }}
                >
                  Yes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="no"
                  id="neg-no"
                  className="border-primary text-primary"
                />
                <Label
                  htmlFor="neg-no"
                  style={{
                    ...PF,
                    fontSize: "13px",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                  }}
                >
                  No
                </Label>
              </div>
            </RadioGroup>
          </Field>
        </div>
        <Field label="Price Justification">
          <Textarea
            {...register("priceJustification")}
            placeholder="Explain your pricing rationale — recent comparable sales, premium features, appreciation potential…"
            rows={3}
            className="input-premium w-full resize-none"
            data-ocid="input-price-justification"
          />
        </Field>
      </FormSection>

      {/* ── Section 5: Positioning ────────────────────────────────────── */}
      <FormSection number={5} title="Market Positioning">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Target Buyer">
            <Select
              defaultValue="investor"
              onValueChange={(v) =>
                setValue("targetBuyer", v, { shouldValidate: false })
              }
            >
              <SelectTrigger
                className="input-premium w-full"
                data-ocid="select-target-buyer"
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="end_user">End User</SelectItem>
                <SelectItem value="premium">Premium Buyer</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Location Advantages">
            <Input
              {...register("locationAdvantages")}
              placeholder="e.g., Golf Course Road frontage, park-facing"
              className="input-premium w-full"
              data-ocid="input-location-advantages"
            />
          </Field>
        </div>
        <Field label="Connectivity / Nearby Landmarks">
          <Textarea
            {...register("connectivity")}
            placeholder="e.g., 5 min to Cyber Hub, 10 min to IGI Airport, metro station 800m…"
            rows={3}
            className="input-premium w-full resize-none"
            data-ocid="input-connectivity"
          />
        </Field>
      </FormSection>

      {/* ── Section 6: USP ────────────────────────────────────────────── */}
      <FormSection number={6} title="Unique Selling Points">
        <Field label="Key Highlights">
          <Textarea
            {...register("keyHighlights")}
            placeholder="e.g., Private terrace with panoramic city views, home automation, dedicated concierge…"
            rows={4}
            className="input-premium w-full resize-none"
            data-ocid="input-key-highlights"
          />
        </Field>
        <Field label="Unique Features">
          <Textarea
            {...register("uniqueFeatures")}
            placeholder="e.g., Custom Italian marble, Gaggenau modular kitchen, private plunge pool…"
            rows={4}
            className="input-premium w-full resize-none"
            data-ocid="input-unique-features"
          />
        </Field>
      </FormSection>

      {/* ── Section 7: Authorization ──────────────────────────────────── */}
      <FormSection number={7} title="Authorization">
        <div
          className="flex items-start gap-4 p-5 rounded-lg transition-smooth"
          style={{
            background: authorized
              ? "oklch(0.93 0.04 305)"
              : "oklch(0.97 0.004 90)",
            border: authorized
              ? "1px solid oklch(0.35 0.30 305 / 0.40)"
              : "1px solid oklch(0.74 0.13 75 / 0.35)",
          }}
        >
          <Checkbox
            id="authorized"
            checked={authorized}
            onCheckedChange={(checked) =>
              setValue("authorized", checked === true, {
                shouldValidate: false,
              })
            }
            className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            data-ocid="checkbox-authorized"
          />
          <label
            htmlFor="authorized"
            style={{
              ...PF,
              fontSize: "13px",
              letterSpacing: "0.03em",
              lineHeight: 1.7,
              cursor: "pointer",
              color: "oklch(0.20 0.02 305)",
            }}
          >
            I confirm the information provided is accurate and agree to a{" "}
            <span style={{ fontWeight: 700, color: "oklch(0.60 0.15 75)" }}>
              2% brokerage fee
            </span>{" "}
            upon successful closure. I also authorize{" "}
            <span style={{ fontWeight: 700, color: "oklch(0.60 0.15 75)" }}>
              video recording and marketing
            </span>{" "}
            of this property by Club Invest Gurgaon for the purpose of private
            listing, digital showcase, and promotion to prospective buyers.
          </label>
        </div>
        <p
          style={{
            ...PF,
            fontSize: "11px",
            letterSpacing: "0.04em",
            color: "oklch(0.50 0.05 305)",
            fontStyle: "italic",
          }}
        >
          Optional — tick to confirm your authorization.
        </p>
      </FormSection>

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p
          style={{
            ...PF,
            fontSize: "11px",
            letterSpacing: "0.04em",
            fontStyle: "italic",
            color: "oklch(0.60 0.15 75)",
            textAlign: "center",
          }}
        >
          ⚠ Only listings valued at ₹2 Cr+ will be considered for placement.
        </p>
        <Button
          type="submit"
          disabled={isSubmitting || anyUploading}
          title={
            anyUploading
              ? "Please wait for photo uploads to complete"
              : undefined
          }
          className="w-full sm:w-auto flex items-center gap-2 min-w-[240px] justify-center transition-smooth"
          style={{
            ...PF,
            fontWeight: 600,
            fontSize: "13px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            background: anyUploading
              ? "oklch(0.55 0.10 305)"
              : "oklch(0.35 0.30 305)",
            color: "oklch(0.98 0.005 90)",
            border: "1.5px solid oklch(0.74 0.13 75 / 0.60)",
            boxShadow: "0 2px 14px oklch(0.35 0.30 305 / 0.28)",
            borderRadius: "0.375rem",
            padding: "0.85rem 1.75rem",
            cursor: anyUploading ? "not-allowed" : undefined,
          }}
          data-ocid="btn-submit-listing"
        >
          {isSubmitting ? (
            <>
              <span
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "oklch(0.74 0.13 75 / 0.40)",
                  borderTopColor: "oklch(0.74 0.13 75)",
                }}
              />
              Submitting…
            </>
          ) : (
            <>
              Submit Private Listing
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
