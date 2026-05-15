"use client";

import { useMemo, useRef, useState } from "react";
import { presets, PresetKey } from "../lib/presets";

type PresetCard = {
  key: PresetKey;
  title: string;
  subtitle: string;
  icon: string;
};

type VersionItem = {
  label: string;
  image: string;
};

const presetCards: PresetCard[] = [
  { key: "shopStandard", title: "Shop", subtitle: "Standard", icon: "✦" },
  { key: "ohneSchatten", title: "Weiß", subtitle: "freistellen", icon: "▣" },
  { key: "technischSauber", title: "Metall", subtitle: "optimieren", icon: "◉" },
  { key: "ohneSchatten", title: "Ohne", subtitle: "Schatten", icon: "☼" },
  { key: "shopStandard", title: "Glanz", subtitle: "reduzieren", icon: "⊘" },
  { key: "technischSauber", title: "Technisch", subtitle: "sauber", icon: "⚙" },
];

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<PresetKey>("shopStandard");
  const [customInstructions, setCustomInstructions] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

function selectFile(selectedFile: File) {
  setFile(selectedFile);
  setResultImage(null);
  setVersions([]);
  setCustomInstructions("");
  setError("");

  if (inputRef.current) {
    inputRef.current.value = "";
  }
}

  async function dataUrlToFile(dataUrl: string, fileName: string) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return new File([blob], fileName, {
      type: "image/png",
    });
  }

  async function handleSubmit() {
    let imageToSend = file;

  if (resultImage) {
  imageToSend = await dataUrlToFile(resultImage, `version-${versions.length}.png`);
}

    if (!imageToSend) {
      setError("Bitte zuerst ein Bild auswählen.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", imageToSend);
      formData.append("preset", preset);
      formData.append("customInstructions", customInstructions);

      const response = await fetch("/api/edit-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bildbearbeitung fehlgeschlagen.");
      }

      const nextVersionNumber = versions.length + 1;
      setResultImage(data.image);
      setVersions((current) => [
        ...current,
        {
          label: `Version ${nextVersionNumber}`,
          image: data.image,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAs() {
    if (!resultImage) return;

    const response = await fetch(resultImage);
    const blob = await response.blob();

    if ("showSaveFilePicker" in window) {
      const picker = await (
        window as unknown as {
          showSaveFilePicker: (options: unknown) => Promise<FileSystemFileHandle>;
        }
      ).showSaveFilePicker({
        suggestedName: "shopfoto-ai.png",
        types: [
          {
            description: "PNG Bild",
            accept: { "image/png": [".png"] },
          },
        ],
      });

      const writable = await picker.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopfoto-ai.png";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) selectFile(droppedFile);
  }

  const buttonLabel = loading
    ? "Bild wird optimiert..."
    : versions.length > 0
      ? `✦ Version ${versions.length + 1} erstellen`
      : "✦ Bild optimieren";

  return (
    <main className="app-shell">
      <div className="header">
        <div className="brand">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.8 7.2h1.7l1.1-1.7h4.8l1.1 1.7h1.7c1.2 0 2.2 1 2.2 2.2v7.1c0 1.2-1 2.2-2.2 2.2H6.8c-1.2 0-2.2-1-2.2-2.2V9.4c0-1.2 1-2.2 2.2-2.2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15.7a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M18 5.2v2.4M16.8 6.4h2.4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h1>ShopFoto AI</h1>
            <p>Produktfotos automatisch optimieren.</p>
          </div>
        </div>

        <div className="badge">✦ KI-Power für Shopbilder</div>
      </div>

      <div className="workspace">
        <section className="left-panel">
          <div className="block">
            <h2>Foto hochladen</h2>

            <div
              className="dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="cloud">☁</div>
              <strong>Bild hineinziehen</strong>
              <span>oder klicken</span>

              <input
                ref={inputRef}
                type="file"
                accept="image/*,.heic,.heif,.webp"
                className="hidden-input"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) selectFile(selectedFile);
                }}
              />
            </div>
          </div>

          <div className="block">
            <h2>Versionen</h2>

            <div className="version-grid">
              <div className="version-card">
                <strong>Original</strong>
                <div className="version-image">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Original" />
                  ) : (
                    <span>Noch kein Bild</span>
                  )}
                </div>
              </div>

              {versions.map((item) => (
                <div className="version-card" key={item.label}>
                  <strong>{item.label}</strong>
                  <div className="version-image">
                    <img src={item.image} alt={item.label} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="block">
            <h2>Preset wählen</h2>

            <div className="preset-grid">
              {presetCards.map((item) => (
                <button
                  key={`${item.title}-${item.key}`}
                  type="button"
                  onClick={() => setPreset(item.key)}
                  className={`preset-card ${preset === item.key ? "active" : ""}`}
                >
                  <span>{item.icon}</span>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="block">
            <h2>Anweisung</h2>

            <textarea
              value={customInstructions}
              maxLength={220}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="z. B. Glanz reduzieren, begradigen, ohne Schatten..."
            />

            <div className="counter">{customInstructions.length} / 220</div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="main-button"
            >
              {buttonLabel}
            </button>

            {error && <div className="error">{error}</div>}
          </div>
        </section>

        <section className="right-panel">
          <div className="result-top">
            <div>
              <h2>Ergebnis</h2>
              <p>
                {resultImage
                  ? `${versions[versions.length - 1]?.label ?? "Version"} ist fertig.`
                  : "Hier erscheint dein bearbeitetes Foto."}
              </p>
            </div>

            <div className="download-row">
              {resultImage ? (
                <>
                  <a href={resultImage} download="shopfoto-ai.png" className="download">
                    PNG herunterladen
                  </a>

                  <button type="button" onClick={handleSaveAs} className="download secondary">
                    Speichern unter...
                  </button>
                </>
              ) : (
                <>
                  <button className="download disabled" disabled>
                    PNG herunterladen
                  </button>

                  <button className="download secondary disabled" disabled>
                    Speichern unter...
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="result-main">
            {loading ? (
              <div className="placeholder">
                <div className="loader" />
                <strong>Bild wird optimiert...</strong>
              </div>
            ) : resultImage ? (
              <img src={resultImage} alt="Optimiertes Produktfoto" />
            ) : (
              <div className="placeholder">
                <strong>Bereit für dein Produktfoto</strong>
                <span>Foto links hochladen und Optimierung starten.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          color: #0f172a;
          background:
            radial-gradient(circle at top left, rgba(79, 70, 229, 0.1), transparent 30%),
            linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
        }

        .app-shell {
          min-height: 100vh;
          padding: 18px;
          overflow: auto;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-icon {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: linear-gradient(135deg, #2563eb, #4f46e5, #7c3aed);
          color: white;
          display: grid;
          place-items: center;
          box-shadow: 0 18px 38px rgba(79, 70, 229, 0.32);
        }

        h1 {
          margin: 0;
          font-size: clamp(26px, 3vw, 34px);
          letter-spacing: -0.04em;
        }

        .brand p {
          margin: 3px 0 0;
          color: #64748b;
        }

        .badge {
          background: #eef2ff;
          color: #3730a3;
          border: 1px solid #c7d2fe;
          border-radius: 999px;
          padding: 12px 18px;
          font-weight: 800;
          white-space: nowrap;
        }

        .workspace {
          display: grid;
          grid-template-columns: minmax(430px, 520px) minmax(0, 1fr);
          gap: 14px;
          align-items: stretch;
        }

        .left-panel,
        .right-panel {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.07);
        }

        .left-panel {
          padding: 16px;
        }

        .block {
          margin-bottom: 16px;
        }

        .block:last-child {
          margin-bottom: 0;
        }

        .block h2,
        .result-top h2 {
          margin: 0 0 10px;
          font-size: 18px;
          letter-spacing: -0.03em;
        }

        .dropzone {
          height: 120px;
          border: 2px dashed #4f46e5;
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff, #f8fafc);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-align: center;
          transition: 0.2s;
        }

        .dropzone:hover {
          background: #f5f7ff;
          transform: translateY(-1px);
        }

        .cloud {
          font-size: 34px;
          color: #4f46e5;
          line-height: 1;
        }

        .dropzone strong {
          margin-top: 8px;
          font-size: 16px;
        }

        .dropzone span {
          margin-top: 3px;
          color: #64748b;
          font-size: 13px;
        }

        .hidden-input {
          display: none;
        }

        .version-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
          gap: 10px;
        }

        .version-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #f8fafc;
          padding: 8px;
        }

        .version-card strong {
          display: block;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .version-image {
          height: 95px;
          border-radius: 10px;
          background: white;
          border: 1px solid #e2e8f0;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .version-image img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        .version-image span {
          font-size: 12px;
          color: #64748b;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 8px;
        }

        .preset-card {
          height: 76px;
          border: 1px solid #dbe3ef;
          background: white;
          border-radius: 13px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: 0.18s;
        }

        .preset-card:hover {
          border-color: #818cf8;
          transform: translateY(-1px);
        }

        .preset-card.active {
          border-color: #4f46e5;
          box-shadow:
            inset 0 0 0 1px #4f46e5,
            0 10px 20px rgba(79, 70, 229, 0.12);
        }

        .preset-card span {
          font-size: 20px;
          color: #4f46e5;
        }

        .preset-card strong {
          margin-top: 3px;
          font-size: 12px;
        }

        .preset-card small {
          color: #64748b;
          font-size: 11px;
        }

        textarea {
          width: 100%;
          height: 76px;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px;
          resize: none;
          font-size: 14px;
          line-height: 1.4;
          outline: none;
        }

        textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .counter {
          margin-top: 4px;
          text-align: right;
          color: #64748b;
          font-size: 12px;
        }

        .main-button {
          width: 100%;
          margin-top: 8px;
          border: none;
          border-radius: 13px;
          padding: 15px;
          color: white;
          font-weight: 900;
          font-size: 16px;
          cursor: pointer;
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          box-shadow: 0 14px 25px rgba(37, 99, 235, 0.23);
        }

        .main-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          margin-top: 8px;
          background: #fef2f2;
          color: #b91c1c;
          padding: 10px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
        }

        .right-panel {
          padding: 16px;
          display: grid;
          grid-template-rows: auto minmax(360px, calc(100vh - 150px));
          gap: 12px;
          min-width: 0;
        }

        .result-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }

        .result-top h2 {
          font-size: 24px;
          margin-bottom: 2px;
        }

        .result-top p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .download-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .download {
          border: 1px solid #818cf8;
          background: white;
          color: #4338ca;
          border-radius: 12px;
          padding: 11px 14px;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
          font-size: 14px;
        }

        .download.secondary {
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .download.disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .result-main {
          border: 1px solid #dbe3ef;
          border-radius: 16px;
          background: white;
          display: grid;
          place-items: center;
          overflow: hidden;
          min-height: 360px;
        }

        .result-main img {
          max-width: 100%;
          max-height: calc(100vh - 180px);
          width: auto;
          height: auto;
          object-fit: contain;
          background: white;
        }

        .placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 8px;
          color: #64748b;
          padding: 20px;
        }

        .placeholder strong {
          color: #334155;
          font-size: 20px;
        }

        .loader {
          width: 36px;
          height: 36px;
          border: 4px solid #e0e7ff;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1050px) {
          .workspace {
            grid-template-columns: 1fr;
          }

          .right-panel {
            grid-template-rows: auto minmax(360px, 70vh);
          }

          .result-main img {
            max-height: 70vh;
          }
        }

        @media (max-width: 720px) {
          .app-shell {
            padding: 12px;
          }

          .header {
            display: block;
          }

          .badge {
            display: inline-block;
            margin-top: 12px;
          }

          .workspace {
            gap: 12px;
          }

          .result-top {
            display: block;
          }

          .download-row {
            justify-content: flex-start;
            margin-top: 12px;
          }

          .right-panel {
            grid-template-rows: auto minmax(320px, 62vh);
          }

          .result-main img {
            max-height: 62vh;
          }
        }
      `}</style>
    </main>
  );
}