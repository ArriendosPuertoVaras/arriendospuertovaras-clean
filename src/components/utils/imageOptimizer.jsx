export const supportsType = (type) => {
  const c = document.createElement('canvas');
  return !!(c.toDataURL && c.toDataURL(type).startsWith(`data:${type}`));
};

export async function fileToImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // no revocar aún; usar la url mientras procesamos
  }
}

function drawScaled(img, maxWidth) {
  const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error("No 2D context");
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas, w, h };
}

async function canvasToBlob(canvas, type, quality) {
  return await new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), type, quality);
  });
}

const TARGETS = { xxl:2560, xl:1600, md:1024, sm:512, thumb:256 };

export async function buildVariants(file) {
  const img = await fileToImage(file);
  const preferAVIF = supportsType('image/avif');
  const preferWEBP = supportsType('image/webp');
  const outType = preferAVIF ? 'image/avif' : (preferWEBP ? 'image/webp' : 'image/jpeg');

  const q = {
    xxl: preferAVIF ? 0.6 : 0.8,
    xl:  preferAVIF ? 0.6 : 0.8,
    md:  preferAVIF ? 0.55: 0.75,
    sm:  preferAVIF ? 0.5 : 0.7,
    thumb: preferAVIF ? 0.5 : 0.7
  };

  const entries = await Promise.all(
    (Object.keys(TARGETS)).map(async (k) => {
      const { canvas, w, h } = drawScaled(img, TARGETS[k]);
      const blob = await canvasToBlob(canvas, outType, q[k]);
      return [k, { blob, w, h, ext: outType.split('/')[1] }];
    })
  );

  URL.revokeObjectURL(img.src);
  return Object.fromEntries(entries);
}