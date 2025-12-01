import DashboardLayout from "../../components/DashboardLayout";
import { useState, useRef } from "react";
// @ts-ignore
import ColorThief from "colorthief";

export default function NewProjectPage() {
  const [form, setForm] = useState({
    companyName: "",
    logo: null as File | null,
    websiteUrl: "",
    productsFile: null as File | null,
    productsUrl: "",
    skuCode: "",
    aboutUs: "",
    mission: "",
    fonts: null as File | null,
  });
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [scrapedWebsiteData, setScrapedWebsiteData] = useState<any>(null);
  const [scrapedProducts, setScrapedProducts] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [exportFormat, setExportFormat] = useState("ppt");
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    const files = (target as HTMLInputElement).files;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : files && files.length > 0
        ? files[0]
        : value,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setForm((prev) => ({ ...prev, logo: file || null }));
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        setLogoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract colors once image is loaded
  const handleImageLoad = () => {
    if (imgRef.current) {
      const colorThief = new ColorThief();
      try {
        const palette = colorThief.getPalette(imgRef.current, 5);
        setBrandColors(
          palette.map(
            (rgb: number[]) =>
              `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
          )
        );
      } catch {
        setBrandColors([]);
      }
    }
  };

  const handleWebsiteScrape = async () => {
    if (!form.websiteUrl || !/^https?:\/\/.+\..+/.test(form.websiteUrl)) {
      alert("Please enter a valid website URL (including http:// or https://)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.websiteUrl }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert("Scraping failed: " + (errorData.error || "Unknown error"));
        setLoading(false);
        return;
      }
      const data = await res.json();
      setScrapedWebsiteData(data);
    } catch (err: any) {
      alert("Network or server error: " + (err?.message || String(err)));
    }
    setLoading(false);
  };

  const handleProductsScrape = async () => {
    setLoading(true);
    if (form.productsUrl) {
      const res = await fetch("/api/scrape-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.productsUrl }),
      });
      const data = await res.json();
      setScrapedProducts(data);
    } else if (form.productsFile) {
      const formData = new FormData();
      formData.append("file", form.productsFile);
      const res = await fetch("/api/scrape-products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setScrapedProducts(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      brandColors,
      websiteData: scrapedWebsiteData,
      products: scrapedProducts,
      exportFormat,
      selectedTemplate,
    };
    const res = await fetch("/api/generate-presentation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `presentation.${exportFormat}`;
      a.click();
    }
    setLoading(false);
  };

  function rgbToHex(rgb: string) {
    const result = rgb.match(/\d+/g);
    if (!result) return rgb;
    return (
      "#" +
      result
        .slice(0, 3)
        .map((x) => ("0" + parseInt(x).toString(16)).slice(-2))
        .join("")
        .toUpperCase()
    );
  }

  return (
    <DashboardLayout>
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: -1,
          background: "linear-gradient(135deg, #3a0ca3 0%, #7209b7 50%, #f72585 100%)",
        }}
      />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: 600, // Increased width for better UX
            padding: "40px 32px",
            borderRadius: 24,
            background: "rgba(40, 20, 60, 0.85)",
            boxShadow: "0 8px 32px rgba(60,0,100,0.18)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <h1 style={{ textAlign: "center", fontSize: 24, marginBottom: 8, fontWeight: 700 }}>
            Create New Project
          </h1>
          <div style={{ width: "100%" }}>
            <label>Company Name</label>
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4, marginBottom: 10 }}
            />
          </div>
          <div style={{ width: "100%" }}>
            <label>Upload Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
            {logoPreview && (
              <img
                ref={imgRef}
                src={logoPreview}
                alt="Logo Preview"
                style={{ display: "none" }}
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
              />
            )}
            {brandColors.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <label>Detected Brand Colors:</label>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {brandColors.map((c) => (
                    <span key={c} style={{ background: c, padding: "4px 12px", borderRadius: 6, color: "#222" }}>
                      {c} <span style={{ marginLeft: 6, color: "#555" }}>{rgbToHex(c)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ width: "100%" }}>
            <label>Website URL</label>
            <input
              type="text"
              name="websiteUrl"
              value={form.websiteUrl}
              onChange={handleChange}
              placeholder="https://yourcompany.com"
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
            />
            <button
              type="button"
              onClick={handleWebsiteScrape}
              disabled={!form.websiteUrl || loading}
              style={{
                marginTop: 8,
                padding: "8px 0",
                width: "100%",
                background: "linear-gradient(90deg, #f72585 0%, #7209b7 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Scrape Website
            </button>
            {scrapedWebsiteData && (
              <div style={{ marginTop: 8, color: "#b197fc", background: "#fff2", borderRadius: 8, padding: 12 }}>
                <div><b>Title:</b> {scrapedWebsiteData.title}</div>
                <div><b>Description:</b> {scrapedWebsiteData.description}</div>
                <div>
                  <b>Headings:</b>
                  <ul>
                    {scrapedWebsiteData.headings?.map((h: string, i: number) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <b>Products:</b>
                  <ul>
                    {scrapedWebsiteData.products?.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div><b>URL:</b> {scrapedWebsiteData.url}</div>
              </div>
            )}
          </div>
          <div style={{ width: "100%" }}>
            <label>Products (Upload CSV/Excel or Enter URL)</label>
            <input
              type="file"
              accept=".csv,.xlsx"
              name="productsFile"
              onChange={handleChange}
              style={{ marginBottom: 8 }}
            />
            <input
              type="text"
              name="productsUrl"
              value={form.productsUrl}
              onChange={handleChange}
              placeholder="https://yourcompany.com/products"
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
            />
            <button
              type="button"
              onClick={handleProductsScrape}
              disabled={(!form.productsUrl && !form.productsFile) || loading}
              style={{
                marginTop: 8,
                padding: "8px 0",
                width: "100%",
                background: "linear-gradient(90deg, #f72585 0%, #7209b7 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Scrape/Upload Products
            </button>
            {scrapedProducts && <div style={{ marginTop: 8, color: "#b197fc" }}>Products data ready!</div>}
          </div>
          <div style={{ width: "100%" }}>
            <label>SKU Code</label>
            <input
              type="text"
              name="skuCode"
              value={form.skuCode}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
            />
          </div>
          <div style={{ width: "100%" }}>
            <label>About Us</label>
            <textarea
              name="aboutUs"
              value={form.aboutUs}
              onChange={handleChange}
              rows={2}
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
              placeholder="About your company..."
            />
          </div>
          <div style={{ width: "100%" }}>
            <label>Mission</label>
            <textarea
              name="mission"
              value={form.mission}
              onChange={handleChange}
              rows={2}
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
              placeholder="Your company's mission..."
            />
          </div>
          <div style={{ width: "100%" }}>
            <label>Upload Fonts</label>
            <input type="file" accept=".ttf,.otf,.woff" name="fonts" onChange={handleChange} />
          </div>
          <div style={{ width: "100%" }}>
            <label>Choose Export Format</label>
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, marginTop: 4 }}>
              <option value="ppt">PowerPoint (.pptx)</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word (.docx)</option>
              <option value="gdoc">Google Docs</option>
              <option value="gslides">Google Slides</option>
            </select>
          </div>
          <div style={{ width: "100%" }}>
            <label>Choose Design Template</label>
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, marginTop: 4 }}>
              <option value="default">Default</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 18,
              width: "100%",
              padding: "12px 0",
              background: "linear-gradient(90deg, #f72585 0%, #7209b7 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(60,0,100,0.12)",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Processing..." : "Export Presentation"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
