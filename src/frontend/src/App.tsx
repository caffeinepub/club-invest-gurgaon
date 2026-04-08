import { Toaster } from "sonner";
import SubmissionForm from "./pages/SubmissionForm";

// ── WhatsApp floating button ────────────────────────────────────────────────
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919268215082"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp with Club Invest Gurgaon"
      data-ocid="btn-whatsapp-float"
      className="transition-smooth"
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "oklch(0.35 0.30 305)",
        color: "oklch(0.74 0.13 75)",
        border: "1.5px solid oklch(0.74 0.13 75 / 0.65)",
        borderRadius: "9999px",
        padding: "10px 18px 10px 14px",
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        boxShadow:
          "0 4px 20px oklch(0.35 0.30 305 / 0.35), 0 1px 4px oklch(0.74 0.13 75 / 0.20)",
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
      }}
    >
      {/* WhatsApp icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden="true"
        style={{ flexShrink: 0, color: "oklch(0.74 0.13 75)" }}
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      Chat on WhatsApp
    </a>
  );
}

export default function App() {
  return (
    <div
      className="min-h-screen flex flex-col bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Toaster
        position="top-right"
        theme="light"
        toastOptions={{
          style: {
            background: "#ffffff",
            border: "1px solid oklch(0.74 0.13 75 / 0.50)",
            color: "oklch(0.16 0.02 305)",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 4px 20px oklch(0.74 0.13 75 / 0.15)",
          },
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50 bg-white"
        style={{ borderBottom: "1.5px solid oklch(0.74 0.13 75 / 0.65)" }}
        data-ocid="header-nav"
      >
        {/* Logo row */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col items-center justify-center text-center gap-2">
          {/* Logo Image */}
          <img
            src="/assets/cig-logo.jpeg"
            alt="Club Invest Gurgaon"
            className="object-contain"
            style={{
              maxHeight: "88px",
              maxWidth: "220px",
              width: "auto",
            }}
          />

          {/* Tagline */}
          <div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "oklch(0.60 0.15 75)",
              }}
            >
              Private Real Estate Opportunity
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                letterSpacing: "0.04em",
                color: "oklch(0.35 0.30 305)",
                marginTop: "2px",
              }}
            >
              Arjun Choudhary · +91 9268215082
            </p>
          </div>
        </div>

        {/* Gurgaon Skyline panorama strip */}
        <div
          style={{
            paddingTop: "8px",
            paddingBottom: "8px",
            borderTop: "1px solid oklch(0.74 0.13 75 / 0.18)",
          }}
          aria-hidden="true"
        >
          <img
            src="/assets/gurgaon-skyline.svg"
            alt="Gurgaon skyline"
            className="w-full block"
            style={{
              maxHeight: "90px",
              objectFit: "contain",
              objectPosition: "center bottom",
            }}
          />
        </div>
      </header>

      {/* Hero Strip */}
      <div
        className="py-16 sm:py-20 px-4"
        style={{
          background:
            "linear-gradient(160deg, #ffffff 0%, oklch(0.97 0.025 305) 50%, #ffffff 100%)",
          borderBottom: "1px solid oklch(0.74 0.13 75 / 0.35)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Gold ornamental line */}
          <div className="flex items-center justify-center gap-4">
            <div
              className="h-px flex-1 max-w-[100px]"
              style={{
                background:
                  "linear-gradient(to right, transparent, oklch(0.74 0.13 75))",
              }}
            />
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "oklch(0.60 0.15 75)",
              }}
            >
              Exclusive · Curated · Confidential
            </p>
            <div
              className="h-px flex-1 max-w-[100px]"
              style={{
                background:
                  "linear-gradient(to left, transparent, oklch(0.74 0.13 75))",
              }}
            />
          </div>

          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              color: "oklch(0.35 0.30 305)",
            }}
          >
            Elite Real Estate Listing
            <span
              className="block mt-2"
              style={{
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)",
                color: "oklch(0.60 0.15 75)",
                letterSpacing: "0.01em",
              }}
            >
              — Private Submission
            </span>
          </h1>

          {/* Gold divider */}
          <div className="gold-divider max-w-xs mx-auto" />

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
              lineHeight: 1.7,
              letterSpacing: "0.03em",
              color: "oklch(0.50 0.05 305)",
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Exclusive placement for properties valued at{" "}
            <span style={{ fontWeight: 700, color: "oklch(0.55 0.15 70)" }}>
              ₹2 Cr+
            </span>{" "}
            in Gurgaon's most prestigious developments. Standard brokerage:{" "}
            <span style={{ fontWeight: 700, color: "oklch(0.55 0.15 70)" }}>
              2%
            </span>
            .
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <SubmissionForm />
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-12 px-4"
        style={{
          background: "oklch(0.975 0.004 90)",
          borderTop: "1.5px solid oklch(0.74 0.13 75 / 0.50)",
        }}
        data-ocid="footer"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Gold ornament */}
          <div className="gold-divider max-w-sm mx-auto" />

          {/* Disclaimer */}
          <div className="text-center">
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                fontStyle: "italic",
                letterSpacing: "0.05em",
                color: "oklch(0.60 0.15 75)",
              }}
            >
              ⚠ Only listings meeting the above criteria of ₹2 Cr+ value will be
              considered.
            </p>
          </div>

          {/* Contact Info */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              letterSpacing: "0.04em",
              color: "oklch(0.50 0.05 305)",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: "oklch(0.16 0.02 305)",
                letterSpacing: "0.08em",
              }}
            >
              Arjun Choudhary
            </span>
            <span
              className="hidden sm:inline"
              style={{ color: "oklch(0.74 0.13 75 / 0.70)" }}
            >
              |
            </span>
            <span>569 Sector-42, Gurgaon – 122002</span>
            <span
              className="hidden sm:inline"
              style={{ color: "oklch(0.74 0.13 75 / 0.70)" }}
            >
              |
            </span>
            <a
              href="tel:+919268215082"
              className="transition-smooth hover:opacity-70"
              style={{ color: "oklch(0.35 0.30 305)", fontStyle: "italic" }}
            >
              +91 9268215082
            </a>
            <span
              className="hidden sm:inline"
              style={{ color: "oklch(0.74 0.13 75 / 0.70)" }}
            >
              |
            </span>
            <a
              href="mailto:Arjun812203ch@gmail.com"
              className="transition-smooth hover:opacity-70"
              style={{ color: "oklch(0.35 0.30 305)", fontStyle: "italic" }}
            >
              Arjun812203ch@gmail.com
            </a>
            <span
              className="hidden sm:inline"
              style={{ color: "oklch(0.74 0.13 75 / 0.70)" }}
            >
              |
            </span>
            <a
              href="https://www.instagram.com/clubinvestgurgaon"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-smooth hover:opacity-70 flex items-center gap-1"
              style={{ color: "oklch(0.35 0.30 305)", fontStyle: "italic" }}
              data-ocid="footer-instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              @clubinvestgurgaon
            </a>
          </div>

          {/* Branding */}
          <div
            className="text-center pt-5"
            style={{ borderTop: "1px solid oklch(0.74 0.13 75 / 0.28)" }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                letterSpacing: "0.04em",
                color: "oklch(0.50 0.05 305)",
              }}
            >
              © {new Date().getFullYear()} Club Invest Gurgaon. Built with love
              using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-smooth hover:opacity-70"
                style={{ color: "oklch(0.35 0.30 305)", fontStyle: "italic" }}
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
      {/* Floating WhatsApp button */}
      <WhatsAppButton />
    </div>
  );
}
