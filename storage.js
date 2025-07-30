  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
  const supabase = createClient('https://tfafmgaavnizcteboecf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYWZtZ2Fhdm5pemN0ZWJvZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDYzNDgsImV4cCI6MjA2OTQyMjM0OH0.YLk_F51XRhpnHw1NAnMx1_PWASk3cq3mgsXqxMgPXqw')
  console.log('Supabase Instance: ', supabase)

//Tao bucket
const { data, error } = await supabase.storage.createBucket('avatars', {
  public: true, 
  fileSizeLimit:"1MB"
})

// Upload file 
async function uploadFile(file) {
  const { data, error } = await supabase.storage.from('bucket_name').upload('file_path', file)
  if (error) {
    //Viet code Mai Anh muon
  } else {
    // Viet code mai anh muon
  }
}

await supabase.storage.from('Ten_bucket').upload('file path', file, {
  upsert:true 
  //Dung khi user muon doi chinh sua hinh anh, video tren post
})
