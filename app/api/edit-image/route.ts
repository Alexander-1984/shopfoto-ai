import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { presets, PresetKey } from "../../../lib/presets";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY fehlt in .env.local" },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const formData = await req.formData();
    const image = formData.get("image");
    const presetKey = (formData.get("preset") || "shopStandard") as PresetKey;
    const customInstructions = String(
      formData.get("customInstructions") || ""
    ).trim();

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Kein Bild hochgeladen." },
        { status: 400 }
      );
    }

    const preset = presets[presetKey] ?? presets.shopStandard;
    const prompt = customInstructions
      ? `${preset.prompt}\n\nZusätzliche Anweisung:\n${customInstructions}`
      : preset.prompt;

    const bytes = await image.arrayBuffer();

const convertedBuffer = await sharp(Buffer.from(bytes))
  .rotate()
  .resize({
    width: 1400,
    height: 1400,
    fit: "inside",
    withoutEnlargement: true,
  })
  .flatten({ background: "#ffffff" })
  .jpeg({ quality: 88, mozjpeg: true })
  .toBuffer();

    const file = await toFile(convertedBuffer, "produktfoto.jpg", {
      type: "image/jpeg",
    });

    const result = await client.images.edit({
      model: "gpt-image-1.5",
      image: file,
      prompt,
      size: "1024x1024",
      output_format: "png",
    });

    const b64 = result.data?.[0]?.b64_json;

    if (!b64) {
      return NextResponse.json(
        { error: "Keine Bilddaten von der KI erhalten." },
        { status: 500 }
      );
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Bildbearbeitung fehlgeschlagen." },
      { status: 500 }
    );
  }
}