import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({
        pdf: {
            maxFileSize: "32MB",
        },
    })
        .middleware(async () => {
            return { userId: "fakeId" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return {
                userId: metadata.userId,
                fileUrl: file.ufsUrl,
                fileName: file.name,
            };
        }),
};
