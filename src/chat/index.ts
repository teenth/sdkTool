import { get, post } from "../request";
const grsai_secret = process.env.GRSAI_SECRET;
const tuzi_secret = process.env.TUZI_SECRET;
const kie_secret = process.env.KIE_SECRET;
const urlPrefix = process.env.URL_PREFIX;
export * as flux from './flux'
if (!grsai_secret || !tuzi_secret || !kie_secret || !urlPrefix) {
  throw new Error(
    `Missing environment variables: grsai_secret: ${grsai_secret}, tuzi_secret: ${tuzi_secret}, kie_secret: ${kie_secret}, urlPrefix: ${urlPrefix}`
  );
}

function formatUrls(urls: string | string[] | undefined) {
  if (Array.isArray(urls)) {
    return urls
  }
  if (urls) {
    return [urls]
  }
  return null
}
// 兼容各个平台的回调参数处理
export const handleChatCallback = (data: any) => {
  // kie
  if (data.code) {
    if (data.code === 200) {
      const { taskId, info } = data.data;
      return {
        id: taskId,
        url: info.result_urls?.[0],
        status: "succeeded",
        results: info.result_urls,
      };
    }
    return {
      id: data.taskId,
      url: "",
      status: "failed",
      results: [],
    };
  }
  if (data.results) {
    return {
      id: data.id,
      url: data.results[0]?.url,
      status: data.status,
      results: data.results,
    };
  }
  // grsai
  return {
    id: data.id,
    url: data.url,
    status: data.status,
    results: [],
  };
};
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
  userImg?: string | string[];
  webHook?: string;
  userId?: string;
  category?: string;
  aspectRatio?: string;
  model?: string;
  point?: string;
}
export async function grsaiChat(req: ChatReq) {
  const response = await post(
    "https://grsai.dakka.com.cn/v1/draw/completions",
    {
      method: "POST",
      headers: grsaiHeader,
      body: {
        model: "sora-image",
        prompt: req.prompt,
        size: req.aspectRatio,
        variants: 1,
        urls: formatUrls(req.userImg),
        webHook: req.webHook,
        shutProgress: false,
      },
    }
  );
  return response;
}

export async function grsaiNanoBananaChat(req: ChatReq) {
  const response = await post(
    "https://grsai.dakka.com.cn/v1/draw/nano-banana",
    {
      method: "POST",
      headers: grsaiHeader,
      body: {
        model: req.model || "nano-banana",
        prompt: req.prompt,
        urls: formatUrls(req.userImg),
        webHook: req.webHook,
        shutProgress: false,
      },
    }
  );
  return response;
}

export async function grsaiResult(id: string) {
  const response = await post(
    `https://grsai.dakka.com.cn/v1/draw/completions`,
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
  console.log("tuziFlux 后续不在维护", req);
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
  console.log("replicateFlux 后续不在维护", req);
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
    `https://grsai.dakka.com.cn/client/common/getModelStatus?model=sora-image`,
    {
      method: "GET",
      headers: grsaiHeader,
    }
  );
  return res;
}

export async function kieChat(req: ChatReq) {
  console.log("kieChat flux 后续不在维护", req);
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
        callBackUrl: req.webHook,
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
