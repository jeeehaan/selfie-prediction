"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import Webcam from "react-webcam";
import { FiBookOpen, FiCamera, FiRefreshCw } from "react-icons/fi";
import { anylizeAction } from "@/action/anylizeAction";

function usePotrait() {
  const [potrait, setPotrait] = useState(false);

  useEffect(() => {
    const screenMedia = window.matchMedia("(orientation: portrait)");

    const onChange = () => setPotrait(screenMedia.matches);
    onChange();
    screenMedia.addEventListener?.("change", onChange);
    return () => screenMedia.removeEventListener?.("change", onChange);
  }, []);

  return potrait;
}

const cleanUpHTML = (html) =>
  String(html ?? "")
    .replace(/\bundefined\b\s*$/i, "")
    .replace(/<\/section>\s*undefined\s*$/i, "</section>");

function Camera() {
  const webcamRef = useRef(null);
  const resultRef = useRef(null);
  const canvasRef = useRef(null);

  const [state, formAction] = React.useActionState(anylizeAction, {
    ok: false,
    html: "",
    rid: "",
  });

  const ridRef = useRef("");
  const ridInputRef = useRef(null);

  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [typedHtml, setTypedHtml] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [responseHtml, setResponseHtml] = useState("");

  const isPortrait = usePotrait(); // 9:16 => 16:9 (untuk rensponsive dari camera nya)
  console.log(isPortrait);
  const videoConstrains = useMemo(
    () => ({
      facingMode: "user",
      width: { ideal: isPortrait ? 720 : 1280 },
      height: { ideal: isPortrait ? 1280 : 720 },
      frameRate: { ideal: 30, max: 60 },
    }),
    [isPortrait]
  );

  function capturePhoto() {
    setErrorMessage("");
    const video = webcamRef.current?.video; // => data nya gaada dia akan menjadi undefined
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth) {
      setErrorMessage("Kamera Belum siap, coba ditunggu sebentar brow!");
    }

    const vw = video.videoWidth,
      vh = video.videoHeight;

    const targetW = isPortrait ? 720 : 1280;
    const targetH = isPortrait ? 1280 : 720;

    const srcAspect = vw / vh,
      dstAspect = targetW / targetH;

    let sx = 0,
      sy = 0,
      sw = vw,
      sh = vh;

    if (srcAspect > dstAspect) {
      sh = vh;
      sw = Math.round(vh * dstAspect);
      sx = Math.round((vw - sw) / 2);
    } else {
      sw = vw;
      sh = Math.round(vw / dstAspect);
      sy = Math.round((vh - sh) / 2);
    }

    canvas.width = targetW;
    canvas.height = targetH;

    const context = canvas.getContext("2d");
    context.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);

    const result = canvas.toDataURL("image/jpeg", 0.9);
    console.log(result);
    setPhotoDataUrl(result);
  }

  function retake() {
    setPhotoDataUrl("");
    setResponseHtml("");
    setTypedHtml("");
    setIsTyping(false);
    setIsLoading(false);
    setErrorMessage("");
    window?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSubmit(e) {
    if (!photoDataUrl) {
      e.preventDefault();
      setErrorMessage("Belum ada foto. Ambil foto dulu");
      return;
    }

    const rid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    ridRef.current = rid;
    if (ridInputRef.current) ridInputRef.current.value = rid;

    setIsLoading(true);
    setTypedHtml("");
    setIsTyping(true);
    setErrorMessage("");
  }

  useEffect(() => {
    if (!state.ok || String(state?.rid ?? "") !== String(ridRef.current))
      return;

    const raw = typeof state.html === "string" ? state.html : "";

    setIsLoading(false);

    if (!raw.trim()) {
      setResponseHtml("");
      setTypedHtml("");
      setIsTyping(false);
      return;
    }

    setResponseHtml(raw);
    resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

    const parts = raw.split(/(?=<section)/g).filter(Boolean);

    let i = 0;
    setTypedHtml("");
    setIsTyping(true);

    const step = () => {
      if (i >= parts.length) {
        setIsTyping(false);
        return;
      }

      const chunk = String(parts[i++] ?? "");
      if (!chunk) {
        setTimeout(step, 0);
        return;
      }

      setTypedHtml((prev) => String(prev ?? "") + chunk);
      setTimeout(step, 160);
    };
    step();
  }, [state]);

  const htmlToRender = cleanUpHTML(
    typedHtml || (isTyping ? "" : responseHtml) || ""
  );

  return (
    <div>
      <div className="relative w-full rounded-2xl overflow-hidden bg-black">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={videoConstrains}
          className={`w-full ${
            isPortrait ? "aspect-[9/16]" : "aspect-video"
          } object-cover`}
          mirrored
          screenshotFormat="image/jpeg"
          screenshotQuality={0.9}
        />

        {photoDataUrl && (
          <img
            src={photoDataUrl}
            alt="capture"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="absolute bottom-2 left-1/2 -translate-1/2 flex items-center gap-3">
          {!photoDataUrl ? (
            <button
              onClick={capturePhoto}
              className="flex items-center justify-center shadow w-14 h-14 rounded-full bg-white text-gray-900"
              title="Ambil foto"
            >
              <FiCamera className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={retake}
              className="flex items-center justify-center shadow w-14 h-14 rounded-full bg-white text-gray-900"
              title="Retake foto"
            >
              <FiRefreshCw className="w-6 h-6" />
            </button>
          )}

          <form action={formAction} onSubmit={onSubmit}>
            <input type="hidden" name="image" value={photoDataUrl} />
            <input
              ref={ridInputRef}
              type="hidden"
              name="rid"
              defaultValue={""}
            />

            <button
              type="submit"
              disabled={!photoDataUrl || isLoading}
              className={`px-4 h-14 rounded-xl text-white shadow transition ${
                !photoDataUrl || isLoading
                  ? "bg-gray-400"
                  : "bg-emerald-700 hover:bg-emerald-800"
              }`}
              title="Analisis & Ramalan"
            >
              {isLoading ? "Memproses..." : "Ramalkan"}
            </button>
          </form>
        </div>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <section ref={resultRef} className="w-full">
        <div className="bg-gray-800 p-6 mt-8 rounded-xl shadow border border-gray-700">
          <div className="flex items-center gap-2 mb-3 text-xl text-yellow-400">
            <FiBookOpen /> Hasil Ramalan
          </div>
          {isTyping && !typedHtml && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />

              <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:.15s]" />

              <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:.3s]" />
            </div>
          )}
          {htmlToRender.trim() ? (
            <div
              className="text-base leading-6
                            [&_section]:mt-3
                            [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-bold
                        "
              dangerouslySetInnerHTML={{ __html: htmlToRender }}
            />
          ) : (
            <div className="bg-gray-500 p-4">
              <p className="font-semibold text-white">
                Ambil Foto Kamu Lalu Tekan Ramalkan! Agar Kamu tau Kondisi Kamu
                Terkini
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Camera;
