import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ✅ Update preview when file changes
  function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {

      setImageFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // preview
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setImageFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImageToCloudinary() {
    setImageLoadingState(true);
    const data = new FormData();
    data.append("productImage", imageFile);
    const response = await axios.post(
      "http://localhost:8002/api/v1/products/upload-image",
      data
    );

    if (response?.data?.success) {
      setUploadedImageUrl(response.data.data.imageUrl);
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) uploadImageToCloudinary();
  }, [imageFile]);

  return (
    <div
      className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}
    >
      <Label className="text-lg font-semibold mb-2 block">Upload Image</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${isEditMode ? "opacity-60" : ""} 
          border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode}
        />

        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className={`${isEditMode ? "cursor-not-allowed" : ""}
              flex flex-col items-center justify-center h-32 cursor-pointer`}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or click to upload image</span>
          </Label>
        )
          : imageLoadingState ? (
            <Skeleton className="h-10 bg-gray-100" />
          ) : (
            <div className="flex flex-col items-center space-y-3">
              {/* ✅ Show preview */}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg shadow"
                />
              )}

              <div className="flex items-center justify-between w-full">
                <p className="text-sm font-medium truncate">{imageFile.name}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleRemoveImage}
                >
                  <XIcon className="w-4 h-4" />
                  <span className="sr-only">Remove File</span>
                </Button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
