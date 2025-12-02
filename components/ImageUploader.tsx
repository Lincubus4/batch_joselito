import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (files: FileList | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onUpload(e.dataTransfer.files);
    },
    [onUpload]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpload(e.target.files);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative group border-2 border-dashed border-gray-700 hover:border-blue-500 bg-gray-900/50 hover:bg-gray-800/80 rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="bg-gray-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
        <UploadCloud className="w-8 h-8 text-blue-400" />
      </div>
      <p className="text-lg font-medium text-gray-200">
        Arrastra y suelta imágenes aquí
      </p>
      <p className="text-sm text-gray-500 mt-2">
        o haz clic para buscar en tu equipo
      </p>
    </div>
  );
};

export default ImageUploader;