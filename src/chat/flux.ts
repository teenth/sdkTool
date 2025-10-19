import { post } from "../request";

const grsai_secret = process.env.GRSAI_SECRET;
const tuzi_secret = process.env.TUZI_SECRET;
const urlPrefix = process.env.URL_PREFIX;

if (!grsai_secret || !tuzi_secret || !urlPrefix) {
  throw new Error(
    `Missing environment variables: grsai_secret: ${grsai_secret}, tuzi_secret: ${tuzi_secret}, urlPrefix: ${urlPrefix}`
  );
}

const grsaiHeader = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${grsai_secret}`,
};

const tuziHeader = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${tuzi_secret}`,
};

export interface ChatReq {
  prompt: string;
  userImg: string;
  webHook: string;
  userId: string;
  category: string;
  aspectRatio: string;
  model?: string;
  point?: string;
}

export async function grsaiFlux(req: ChatReq) {
  const response = await post("https://grsai.dakka.com.cn/v1/draw/flux", {
    method: "POST",
    headers: grsaiHeader,
    body: {
      model: req.model || "flux-kontext-pro",
      prompt: req.prompt,
      aspectRatio: req.aspectRatio,
      variants: 1,
      urls: req.userImg ? [req.userImg] : null,
      webHook: req.webHook,
      shutProgress: false,
    },
  });
  return response;
}

export async function grsaiFluxResult(id: string) {
  const response = await post(
    `https://grsai.dakka.com.cn/v1/draw/result`,
    {
      method: "POST",
      headers: grsaiHeader,
      body: {
        id,
      },
    }
  );
  return response;
}

export async function tuziFlux(req: ChatReq) {
  const prompt = `${req.userImg}, ${req.prompt}`;
  const res = await fetch("https://api.tu-zi.com/v1/images/generations", {
    method: "POST",
    headers: tuziHeader,
    body: JSON.stringify({
      model: "flux-kontext-pro",
      prompt,
      aspect_ratio: req.aspectRatio,
      output_format: "png",
      safety_tolerance: 2,
      prompt_upsampling: false,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    const error = await res.text();
    return {
      code: 500,
      data: null,
      message: error,
    };
  }
}

export async function replicateFlux(req: ChatReq) {
  const prompt = `${req.userImg}, ${req.prompt}`;
  const res = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions",
    {
      method: "POST",
      headers: tuziHeader,
      body: JSON.stringify({
        model: "flux-kontext-pro",
        prompt,
        aspect_ratio: req.aspectRatio,
        output_format: "png",
        safety_tolerance: 2,
        prompt_upsampling: false,
      }),
    }
  );
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    const error = await res.text();
    return {
      code: 500,
      data: null,
      message: error,
    };
  }
}