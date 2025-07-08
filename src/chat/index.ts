
import { get, post } from "../request";
const grsai_secret = process.env.GRSAI_SECRET;
const tuzi_secret = process.env.TUZI_SECRET;
const kie_secret = process.env.KIE_SECRET;
const urlPrefix = process.env.URL_PREFIX;
if (!grsai_secret || !tuzi_secret || !kie_secret || !urlPrefix) {
  throw new Error(`Missing environment variables: grsai_secret: ${grsai_secret}, tuzi_secret: ${tuzi_secret}, kie_secret: ${kie_secret}, urlPrefix: ${urlPrefix}`);
}
// 兼容各个平台的回调参数处理
export const handleChatCallback = (data: any) => {
  // kie
  if (data.code) {
    if (data.code === 200) {
      const { taskId, info } = data.data;
      return {
        id: taskId,
        url: info.resultImageUrl,
        status: "succeeded",
      };
    }
    return {
      id: data.taskId,
      url: '',
      status: 'failed',
    };
  }
  // grsai
  return {
    id: data.id,
    url: data.url,
    status: data.status,
  };
}
const grsaiHeader = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${grsai_secret}`,
};
const tuziHeader = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${tuzi_secret}`,
};

const kieHeader = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${kie_secret}`,
};
export const type = {
  GRSAI: "grsai",
  TUZI: "tuzi",
};
export interface ChatReq {
  prompt: string;
  userImg: string;
  webHook?: string;
  userId: string;
  category: string;
  aspectRatio: string;
  model?: string;
  point?: string;
}
export async function grsaiChat(req: ChatReq) {
  const response = await post(
    "https://api.grsai.com/v1/draw/completions",
    {
      method: "POST",
      headers: grsaiHeader,
      body: {
        model: "sora-image",
        prompt: req.prompt,
        size: req.aspectRatio,
        variants: 1,
        urls: [req.userImg],
        webHook: `${urlPrefix}/api/generation/chat/callback`,
        shutProgress: false,
      },
    }
  );
  return response;
}

export async function grsaiResult(id: string) {
  const response = await post(`https://api.grsai.com/v1/draw/completions`, {
    method: "POST",
    headers: grsaiHeader,
    body: {
      id,
    },
  });
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

export async function grsaiStatus() {
  const res = await get(
    `https://api.grsai.com/client/common/getModelStatus?model=sora-image`,
    {
      body: {},
      method: "GET",
      headers: grsaiHeader,
    }
  );
  return res;
}

export async function kieChat(req: ChatReq) {
  const res = await post(
    "https://kieai.erweima.ai/api/v1/flux/kontext/generate",
    {
      method: "POST",
      headers: kieHeader,
      body: {
        prompt: req.prompt,
        input_image: req.userImg,
        size: req.aspectRatio,
        output_format: "png",
        enableFallback: true,
        fallbackModel: "GPT_IMAGE_1",
        callBackUrl: `${urlPrefix}/api/generation/chat/callback`,
      },
    }
  );
  const { data } = res;
  return {
    code: 200,
    data: {
      id: data.taskId,
    },
  };
}
