import type { Request, Response, NextFunction } from "express";

import ytDlp from "yt-dlp-exec";

import ytdl from "ytdl-core";

import type { Agent } from "http";

interface FormatOption {
  format_id: string;

  ext: string;

  resolution: string | undefined;

  quality: string | undefined;

  bitrate: number | undefined;

  fps: number | undefined;

  note: string | undefined;

  filesize: number | undefined;

  hasAudio: boolean;
}

const formatBitrate = (bitrate: number | undefined): string | undefined => {
  if (!bitrate) return undefined;

  if (bitrate >= 1000000) return `${(bitrate / 1000000).toFixed(1)} Mbps`;

  if (bitrate >= 1000) return `${(bitrate / 1000).toFixed(0)} kbps`;

  return `${bitrate} bps`;
};

const extractQuality = (
  resolution: string | undefined,
  note: string | undefined
): string | undefined => {
  if (resolution) return resolution;

  if (note) {
    const qualityMatch = note.match(/(\d+p?)/i);

    if (qualityMatch)
      return qualityMatch[1]?.toLowerCase().endsWith("p")
        ? qualityMatch[1].toLowerCase()
        : `${qualityMatch[1]}p`;
  }

  return undefined;
};

export const listFormats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url } = req.body as { url?: string };

    if (!url || typeof url !== "string") {
      res
        .status(400)
        .json({
          status: "error",
          message: "URL is required and must be a string",
        });

      return;
    }

    let canonicalUrl: string;

    try {
      const videoId = ytdl.getURLVideoID(url);

      canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } catch {
      res.status(400).json({ status: "error", message: "Invalid YouTube URL" });

      return;
    }

    const requestHeaders = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",

      "accept-language": "en-US,en;q=0.9",

      referer: "https://www.youtube.com/",

      cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+832",
    };

    try {
      const timeoutMs = 8000;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("ytdl timeout")), timeoutMs)
      );

      const info = await Promise.race([
        ytdl.getInfo(canonicalUrl, {
          requestOptions: { headers: requestHeaders } as {
            headers: Record<string, string>;
            agent?: Agent;
          },
        }),

        timeoutPromise,
      ]);

      const videoFormats = info.formats.filter(
        (f) => (f as any).hasVideo && !!f.container
      );

      const options: FormatOption[] = videoFormats.map((f) => {
        const resolution = f.height ? `${f.height}p` : undefined;

        const quality = extractQuality(resolution, (f as any).qualityLabel);

        const bitrate = (f as any).bitrate
          ? Number((f as any).bitrate)
          : undefined;

        return {
          format_id: f.itag?.toString() || "",

          ext: f.container || "",

          resolution,

          quality,

          bitrate,

          fps: (f as any).fps,

          note: (f as any).qualityLabel,

          filesize: (f as any).contentLength
            ? Number((f as any).contentLength)
            : undefined,

          hasAudio: !!(f as any).hasAudio,
        };
      });

      // Extract unique values for filtering

      const uniqueExts = Array.from(
        new Set(options.map((o) => o.ext).filter(Boolean))
      ).sort();

      const uniqueQualities = Array.from(
        new Set(options.map((o) => o.quality).filter(Boolean))
      ).sort((a, b) => {
        const numA = parseInt(a?.replace("p", "") || "0");

        const numB = parseInt(b?.replace("p", "") || "0");

        return numB - numA; // Sort descending (highest first)
      });

      const uniqueBitrates = Array.from(
        new Set(
          options
            .map((o) => o.bitrate)
            .filter((b): b is number => b !== undefined)
        )
      )

        .sort((a, b) => b - a) // Sort descending

        .map(formatBitrate)

        .filter((b): b is string => b !== undefined);

      // Check if ffmpeg is available for merging

      const { spawnSync } = await import("child_process");

      const ffmpegAvailable =
        spawnSync("ffmpeg", ["-version"], { encoding: "utf-8" }).status === 0;

      res.json({
        status: "success",

        formats: options,

        availableOptions: {
          formats: uniqueExts,

          qualities: uniqueQualities,

          bitrates: uniqueBitrates,
        },

        ffmpegAvailable: ffmpegAvailable,

        canMerge: ffmpegAvailable, // Indicates if video-only formats can be merged with audio
      });

      return;
    } catch (_ytdlErr) {
      const isVercel = !!process.env.VERCEL;

      if (isVercel) {
        res.status(200).json({
          status: "limited",

          message: "Format listing fallback disabled in serverless environment",

          formats: [],

          availableOptions: { formats: [], qualities: [], bitrates: [] },

          ffmpegAvailable: false,

          canMerge: false,
        });

        return;
      }

      try {
        const timeoutMs = 25000;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout listing formats")),
            timeoutMs
          )
        );

        const infoRaw = await Promise.race([
          ytDlp(canonicalUrl, {
            dumpSingleJson: true,

            skipDownload: true,

            quiet: true,

            noPlaylist: true,

            jsRuntimes: "node",
          } as any),

          timeoutPromise,
        ]);

        const infoObj =
          typeof infoRaw === "string"
            ? JSON.parse(infoRaw)
            : Buffer.isBuffer(infoRaw)
            ? JSON.parse(infoRaw.toString("utf-8"))
            : (infoRaw as any);

        const formats = Array.isArray(infoObj?.formats) ? infoObj.formats : [];

        const videoOnlyOrProgressive = formats.filter(
          (f: any) => f.vcodec && f.vcodec !== "none" && f.ext
        );

        const options: FormatOption[] = videoOnlyOrProgressive.map((f: any) => {
          const resolution = f.height ? `${f.height}p` : undefined;

          const quality = extractQuality(resolution, f.format_note);

          const bitrate = f.tbr
            ? Number(f.tbr) * 1000
            : f.vbr
            ? Number(f.vbr) * 1000
            : undefined;

          return {
            format_id: f.format_id || "",

            ext: f.ext || "",

            resolution,

            quality,

            bitrate,

            fps: f.fps,

            note: f.format_note,

            filesize: f.filesize || f.filesize_approx,

            hasAudio: !!(f.acodec && f.acodec !== "none"),
          };
        });

        const uniqueExts = Array.from(
          new Set(options.map((o) => o.ext).filter(Boolean))
        ).sort();

        const uniqueQualities = Array.from(
          new Set(options.map((o) => o.quality).filter(Boolean))
        ).sort((a, b) => {
          const numA = parseInt(a?.replace("p", "") || "0");

          const numB = parseInt(b?.replace("p", "") || "0");

          return numB - numA;
        });

        const uniqueBitrates = Array.from(
          new Set(
            options
              .map((o) => o.bitrate)
              .filter((b): b is number => b !== undefined)
          )
        )

          .sort((a, b) => b - a)

          .map(formatBitrate)

          .filter((b): b is string => b !== undefined);

        const { spawnSync } = await import("child_process");

        const ffmpegAvailable =
          spawnSync("ffmpeg", ["-version"], { encoding: "utf-8" }).status === 0;

        res.json({
          status: "success",

          formats: options,

          availableOptions: {
            formats: uniqueExts,

            qualities: uniqueQualities,

            bitrates: uniqueBitrates,
          },

          ffmpegAvailable,

          canMerge: ffmpegAvailable,
        });
      } catch (fallbackErr) {
        res.status(200).json({
          status: "limited",

          message: "Unable to list formats via fallback",

          formats: [],

          availableOptions: { formats: [], qualities: [], bitrates: [] },

          ffmpegAvailable: false,

          canMerge: false,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};
