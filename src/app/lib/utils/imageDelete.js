/**
 * Deletes an image from the external API using search_Id
 * @param {string} searchId - The search_Id of the image to delete
 * @param {string} postType - Either 'lost' or 'found'
 * @returns {Promise<Object>} Response from the external API
 */
export async function deleteImageFromExternalApi(searchId, postType) {
  if (!searchId) {
    console.log("No search_Id provided, skipping image deletion");
    return { success: false, message: "No search_Id provided" };
  }

  if (!postType || !['lost', 'found'].includes(postType)) {
    console.log("Invalid or missing postType, skipping image deletion");
    return { success: false, message: "Invalid or missing postType. Must be 'lost' or 'found'" };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_API_URL || "http://18.136.211.184:8000";
    const endpoint = postType === 'lost' ? 'delete-lost-image' : 'delete-found-image';
    const apiUrl = `${baseUrl}/${endpoint}/${searchId}`;
    console.log(`Deleting ${postType} image from external API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to delete image from external API: ${errorText}`);
      return { 
        success: false, 
        message: `External API error: ${response.status}`,
        error: errorText 
      };
    }

    const result = await response.json();
    console.log(`Image deleted successfully from external API:`, result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting image from external API:", error);
    return { 
      success: false, 
      message: error.message,
      error: error 
    };
  }
}
