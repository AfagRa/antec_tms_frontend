export function getMaterialHref(material: { url?: string | null; filePath?: string | null; file_path?: string | null }): string | null {
  if (material.url) return material.url
  const fp = material.filePath ?? material.file_path
  if (fp) return `http://localhost:5014${fp}`
  return null
}
