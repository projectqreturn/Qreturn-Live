import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { updateUserVerification } from "../../lib/actions/user.action";

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Check if it's a File or Blob object
    if (!(imageFile instanceof Blob)) {
      return NextResponse.json(
        { error: "Invalid file object" },
        { status: 400 }
      );
    }

    // Get mime type
    let mimeType = imageFile.type;
    
    if (!mimeType) {
      const fileName = imageFile.name?.toLowerCase() || '';
      if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else {
        return NextResponse.json(
          { error: "Could not determine file type" },
          { status: 400 }
        );
      }
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: `Invalid file type: ${mimeType}` },
        { status: 400 }
      );
    }

    // Initialize Gemini API
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
      }
    });

    // Convert File to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    const prompt = `Analyze this image and determine if it's a valid Sri Lankan National Identity Card (NIC).

OLD NIC: Brown/yellow background, "Sri Lanka / National Identity Card" text, black-white photo on left, NIC number visible, has Name, DOB, Address, Signature fields.

NEW SMART NIC: Light blue/teal background, Sri Lanka emblem, chip icon, NIC number at top, color photo on right, has Name, DOB, Sex, Address fields, barcode/QR at bottom.

Return ONLY valid JSON in this exact format with no additional text:
{"nic": "extracted_number_or_empty", "isVerified": true_or_false}`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    // Call Gemini API
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const responseText = response.text();

    console.log('Gemini raw response:', responseText);

    // Parse JSON response
    let verificationData;
    try {
      // Clean up response - remove markdown, code blocks, extra whitespace
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s+|\s+$/g, '')
        .trim();
      
      // Find JSON object in response
      const jsonMatch = cleanedResponse.match(/\{[^}]+\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      verificationData = JSON.parse(cleanedResponse);
      
      // Validate response structure
      if (typeof verificationData.isVerified !== 'boolean') {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      return NextResponse.json(
        { 
          error: "Failed to parse AI response", 
          details: responseText,
          success: false,
          nic: "",
          isVerified: false
        },
        { status: 500 }
      );
    }

    // If verification is successful, update the user in the database
    if (verificationData.isVerified && verificationData.nic) {
      try {
        const updatedUser = await updateUserVerification(
          userId,
          true,
          verificationData.nic
        );
        
        if (!updatedUser) {
          console.error("Failed to update user verification in database");
        } else {
          console.log("User verification updated successfully:", updatedUser.email);
        }
      } catch (dbError) {
        console.error("Database update error:", dbError);
        // Continue with the response even if DB update fails
      }
    }

    return NextResponse.json({
      success: true,
      nic: verificationData.nic || "",
      isVerified: verificationData.isVerified || false
    });

  } catch (error) {
    console.error("Image analysis error:", error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: "API configuration error", success: false },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again.", success: false },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to process image", 
        details: error.message,
        success: false,
        nic: "",
        isVerified: false
      },
      { status: 500 }
    );
  }
}