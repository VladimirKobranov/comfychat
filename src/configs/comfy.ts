export const positivePrompt = `
masterpiece, best quality, ultra-detailed, 8k, photorealistic oil painting, cinematic lighting, soft focus,big breasts,  open neckline, open breasts,
1girl, solo, blonde wavy short hair, messy hair, floating hair, looking up, blue eyes, soft gaze, parted lips, pale skin, delicate facial features, **simple white long-sleeve top, uncovered shoulders, high neckline,open clothing**, gold necklace with green gem pendant, upper body shot,
background of cosmic space, giant glowing planet with clouds, bright light beam from planet, starry sky, bokeh, dreamy atmosphere, soft light, ethereal, fantasy aesthetic, depth of field, painterly details, smooth skin texture

`

export const negativePrompt = `
lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, deformed, disfigured, ugly, extra limbs, missing limbs, poorly drawn face, mutated, mutated hands, extra fingers, bad proportions, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, long neck, text, signature, watermark, cartoon, anime, 3d render, realistic (non-painting style)
`

export const comfyDefaults = {
  model: 'DreamShaper_8_pruned.safetensors',
  positive: positivePrompt,
  negative: negativePrompt,
  width: 512,
  height: 512,
  batch_size: 1,
  steps: 20,
  cfg: 7,
  sampler_name: 'euler',
  scheduler: 'normal',
  denoise: 1,
}
