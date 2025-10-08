const fs = require('fs')

// Ways to interact with AWS S3
// AWS SDK v3 | Without SDK
//  * Upload to server then to S3
//  * Upload directly from FE to S3 (with presigned URL from backend)
//  * In both cases you can either get a permanent URL or a temporary signed URL (private/sensitive files - documents, photos)

// getSignedUrl
// * Purpose: Generate temporary URLs to view/download existing S3 files
// * Runs on: Backend only (needs AWS secrets)
// * Frontend gets: A temporary URL string to display images
// * Use case: Private images that need access control

// getPresignedUploadUrl - Temporary upload URLs
// * Purpose: Allow frontend to upload directly to S3
// * Runs on: Backend generates, Frontend uses for upload
// * Frontend gets: Upload URL + form fields to POST file
// * Use case: Direct frontend-to-S3 uploads (bypasses server)

// Summary:
// * getSignedUrl: "Here's a temporary link to view this image"
// * getPresignedUploadUrl: "Here's temporary permission to upload a file"
// * Both require backend to generate (because of AWS secrets)

// Side note: The Bucket itself and Bucket Policy, IAM Policy, Setting ACL can be done in code!

async function uploadFile(fileBuffer, fileName, contentType) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
      
    const client = new S3Client({
        region: process.env.S3_BUCKET_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })

    // const fileStream = fs.createReadStream(filePath) // used fileBuffer instead
    // Use buffers: Small files (< 50MB), like images
    // Use streams: Large files (videos, etc.) to avoid memory issues

    const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Body: fileBuffer,
        Key: fileName,
        CacheControl: 'max-age=2592000',
        ContentType: contentType,
    }
    const command = new PutObjectCommand(uploadParams)
    await client.send(command)
    // const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileName}`
    const fileUrl = `${process.env.CLOUDFRONT_URL}/${fileName}`
    return fileUrl
}

async function getPresignedUploadUrl(fileName, contentType) {
    const { S3Client } = await import('@aws-sdk/client-s3')
    const { createPresignedPost } = await import('@aws-sdk/s3-presigned-post')
      
    const client = new S3Client({
        region: process.env.S3_BUCKET_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })

    const presignedPost = await createPresignedPost(client, {
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Fields: {
            'Content-Type': contentType,
            'Cache-Control': 'max-age=2592000'
        },
        Conditions: [
            ['content-length-range', 0, 10485760], // Max 10MB
            ['starts-with', '$Content-Type', 'image/']
        ],
        Expires: 600 // 10 minutes to complete upload
    })

    return presignedPost
}

module.exports = { uploadFile, getPresignedUploadUrl }
