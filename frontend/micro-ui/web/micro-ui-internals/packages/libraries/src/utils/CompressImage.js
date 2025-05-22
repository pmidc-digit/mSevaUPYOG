export const compressImage = (file) => {
  //const targetSizeBytes = targetSizeMB * 1024 * 1024;
  let targetSizeBytes = process.env.IMAGE_UPLOAD_SIZE || 2097152;
  let  maxWidth = process.env.IMAGE_MAX_WIDTH || 1920;

  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      image.src = e.target.result;
    };

    reader.onerror = reject;
    image.onerror = reject;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / image.width);
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const fallbackBlob = () => {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        const byteString = atob(dataUrl.split(",")[1]);
        const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const intArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }

        return new Blob([arrayBuffer], { type: mimeString });
      };

      const compress = (quality) => {
        canvas.toBlob((blob) => {
          if (!blob) blob = fallbackBlob();

          if (blob.size <= targetSizeBytes || quality <= 0.1) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            compress(quality - 0.05);
          }
        }, "image/jpeg", quality);
      };

      compress(0.9);
    };

    reader.readAsDataURL(file);
  });
};