import {
    generateUploadButton,
    generateUploadDropzone,
    generateReactHelpers
} from "@uploadthing/react";

/**
 * For Token-based uploads (No Backend), we point directly to the UploadThing edge.
 */
const opts = {
    url: "https://uploadthing.com/api/upload"
};

export const UploadButton = generateUploadButton(opts);
export const UploadDropzone = generateUploadDropzone(opts);
export const { useUploadThing, uploadFiles } = generateReactHelpers(opts);
