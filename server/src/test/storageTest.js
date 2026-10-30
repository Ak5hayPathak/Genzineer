import {
  uploadFile,
  getFile,
  deleteFile,
} from "../services/storage.service.js";

const testId = `test-${Date.now()}`;

const markdownKey = `documents/${testId}.md`;
const imageKey = `media/images/${testId}.png`;

const markdownContent = `# GenZineer Storage Test

This is a test Markdown document.

- Upload successful
- Download successful
- Delete successful
`;

async function runStorageTests() {
  try {
    // 1. Upload Markdown
    console.log("Uploading Markdown file...");

    await uploadFile({
      key: markdownKey,
      body: markdownContent,
      contentType: "text/markdown",
    });

    console.log("Markdown uploaded successfully!");

    // 2. Retrieve Markdown
    console.log("Retrieving Markdown file...");

    const markdownFile = await getFile(markdownKey);
    const downloadedContent = await markdownFile.body.transformToString();

    if (downloadedContent !== markdownContent) {
      throw new Error("Markdown content verification failed");
    }

    console.log("Markdown retrieved and verified!");

    // 3. Upload image buffer
    console.log("Uploading image buffer...");

    const imageBuffer = Buffer.from("GenZineer image upload test");

    await uploadFile({
      key: imageKey,
      body: imageBuffer,
      contentType: "image/png",
      contentLength: imageBuffer.length,
    });

    console.log("Image uploaded successfully!");

    // 4. Delete Markdown
    console.log("Deleting Markdown file...");

    await deleteFile(markdownKey);

    console.log("Markdown deleted successfully!");

    // 5. Delete image
    console.log("Deleting image...");

    await deleteFile(imageKey);

    console.log("Image deleted successfully!");

    console.log("\nAll storage tests passed!");
  } catch (error) {
    console.error("\nStorage test failed:", error.message);
    process.exitCode = 1;
  }
}

runStorageTests();
