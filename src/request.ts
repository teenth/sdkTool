
export interface PostOptions {
  body: any;
  [key: string]: any;
}
export const get = async (url: string, options?: PostOptions) => {
  const res = await fetch(url, options);
  if (res.ok) {
    return res.json();
  }
  return {
    code: res.status,
    message: res.statusText,
  };
};

export const post = async (url: string, options?: PostOptions) => {
  const res = await fetch(url, {
    method: "POST",
    ...options,
    body: JSON.stringify(options?.body),
  });
  if (res.ok) {
    const data = await res.json();
    return data;
  }
  return {
    code: res.status,
    message: res.statusText,
  };
};


