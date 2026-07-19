import { createClient } from '@supabase/supabase-js'

// Initialize Supabase variables from environment variables (using Vite's import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Export the singleton Supabase client for use throughout the application
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Transforms a Supabase Storage URL to use Supabase Image Transformations.
 * Converts the URL path from object retrieval to rendering service and adds query options.
 *
 * @param {string} url - The original Supabase storage public URL.
 * @param {object} options - Transformation options like width, height, quality, resize, and format.
 * @returns {string} The transformed URL or the original URL if transformation is not applicable.
 */
export function getTransformedUrl(url, options = {}) {
  if (!url || typeof url !== "string") return url;

  // Verify if Supabase Image Transformations are enabled in the environment variables
  const enableTransformations = import.meta.env.VITE_ENABLE_SUPABASE_TRANSFORMATIONS === "true";
  if (!enableTransformations) {
    return url;
  }

  // Only apply transformation to public Supabase Storage URLs
  if (!url.includes("/storage/v1/object/public/")) {
    return url;
  }

  // Convert object endpoint to render endpoint
  let transformedUrl = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");

  const params = [];

  if (options.width) {
    params.push(`width=${options.width}`);
  }
  if (options.height) {
    params.push(`height=${options.height}`);
  }
  if (options.resize) {
    params.push(`resize=${options.resize}`);
  }

  // Use webp format by default for better performance
  const format = options.format || "webp";
  params.push(`format=${format}`);

  // Default quality to 80 for reasonable compression and visual quality
  const quality = options.quality || 80;
  params.push(`quality=${quality}`);

  const separator = transformedUrl.includes("?") ? "&" : "?";
  return `${transformedUrl}${separator}${params.join("&")}`;
}