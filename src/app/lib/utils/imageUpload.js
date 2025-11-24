import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads the main image to external API with UUID filename
 * @param {string} imageUrl - The Cloudinary URL of the image
 * @param {string} postType - Either 'lost' or 'found'
 * @returns {Promise<{searchId: string, success: boolean}>} The UUID search ID with extension and upload status
 */
export async function uploadMainImageToExternalApi(imageUrl, postType) {
  console.log('=== Starting uploadMainImageToExternalApi ===');
  console.log('Image URL:', imageUrl);
  console.log('Post Type:', postType);
  
  try {
    // Fetch the image from Cloudinary
    console.log('Fetching image from Cloudinary...');
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from Cloudinary: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    console.log('Image fetched successfully from Cloudinary');

    // Get the image blob
    const imageBlob = await imageResponse.blob();
    console.log('Image blob size:', imageBlob.size, 'bytes');
    console.log('Image blob type:', imageBlob.type);
    
    // Extract file extension from URL or content type
    let extension = 'jpg'; // default
    const urlExtMatch = imageUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    if (urlExtMatch) {
      extension = urlExtMatch[1].toLowerCase();
    } else {
      // Try to get from content type
      const contentType = imageBlob.type;
      if (contentType === 'image/png') extension = 'png';
      else if (contentType === 'image/jpeg' || contentType === 'image/jpg') extension = 'jpg';
      else if (contentType === 'image/webp') extension = 'webp';
      else if (contentType === 'image/gif') extension = 'gif';
    }
    console.log('Determined file extension:', extension);

    // Generate UUID for the image
    const uuid = uuidv4();
    const searchId = `${uuid}.${extension}`;
    console.log('Generated search_Id:', searchId);
    
    // Create a new file with the UUID name
    const renamedFile = new File([imageBlob], searchId, { type: imageBlob.type });
    console.log('Created file with name:', renamedFile.name);

    // Prepare form data for external API
    const formData = new FormData();
    formData.append('file', renamedFile);

    // Upload to external API
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_API_URL || 'http://13.229.70.244:8000';
    const uploadUrl = `${baseUrl}/upload-image`;
    console.log('Uploading to external API:', uploadUrl);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('External API response status:', uploadResponse.status);
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('External API upload failed with status:', uploadResponse.status);
      console.error('Error response:', errorText);
      throw new Error(`External API upload failed (${uploadResponse.status}): ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('External API upload successful:', uploadResult);
    console.log('Returning search_Id:', searchId);

    return {
      searchId,
      success: true,
      apiResponse: uploadResult
    };

  } catch (error) {
    console.error('=== Error in uploadMainImageToExternalApi ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}
