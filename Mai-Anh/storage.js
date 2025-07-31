import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://tfafmgaavnizcteboecf.supabase.co'
const supabase = createClient(
  supabaseUrl,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYWZtZ2Fhdm5pemN0ZWJvZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDYzNDgsImV4cCI6MjA2OTQyMjM0OH0.YLk_F51XRhpnHw1NAnMx1_PWASk3cq3mgsXqxMgPXqw'
)
const bucket_id = 'mindxtt'

console.log('Supabase Instance: ', supabase)

// Create bucket if it doesn't exist (ignore error if already exists)
async function ensureBucket() {
  try {
    const { error } = await supabase.storage.createBucket(bucket_id, {
      public: true,
      fileSizeLimit: "2MB"
    })
    if (error && !error.message.includes('already exists')) {
      console.error('Error creating bucket:', error)
    }
  } catch (e) {
    console.error('Bucket creation exception:', e)
  }
}
ensureBucket()

/**
 * Upload a file to Supabase Storage.
 * @param {File} file - The file to upload.
 * @param {string} [path] - Optional path/filename in the bucket. Defaults to file.name.
 * @param {boolean} [upsert=false] - Whether to overwrite if file exists.
 * @returns {Promise<{url: string|null, error: any}>}
 */
export async function uploadFile(file, path, upsert = false) {
  if (!file) return { url: null, error: 'No file provided' }
  // Default to post_images/ + filename if not already in a subfolder
  let filePath = path || `${Date.now()}_${file.name}`
  if (!filePath.startsWith('post_images/')) {
    filePath = `post_images/${filePath}`
  }
  try {
    const { data, error } = await supabase.storage
      .from(bucket_id)
      .upload(filePath, file, { upsert })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, error }
    }

    // Construct public URL manually as requested
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket_id}/${filePath}`
    return { url: publicUrl, error: null }
  } catch (e) {
    console.error('Upload exception:', e)
    return { url: null, error: e }
  }
}

/**
 * Get a public URL for an image in Supabase Storage.
 * @param {string} filePath - The path to the file in the bucket (e.g. 'post_images/filename.jpg')
 * @returns {string} - The public URL to access the image.
 */
export function getImageUrl(filePath) {
  if (!filePath) return null
  // Ensure filePath does not start with a leading slash
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
  return `${supabaseUrl}/storage/v1/object/public/${bucket_id}/${cleanPath}`
}
