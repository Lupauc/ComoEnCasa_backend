import { UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary';

export const uploadToCloudinary = (
    buffer: Buffer,
    folder: string,
    publicId?: string
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const options: Record<string, unknown> = { folder };
        if (publicId) options.public_id = publicId;

        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('No result from Cloudinary'));
            resolve(result);
        });

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
};