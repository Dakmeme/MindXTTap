

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
