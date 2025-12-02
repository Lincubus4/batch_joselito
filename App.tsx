import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import ImageUploader from './components/ImageUploader';
import { ProcessedImage, FitMode } from './types';
import { processImage } from './utils/imageProcessor';
import { Download, Trash2, Archive, ArrowDownCircle } from 'lucide-react';
import JSZip from 'jszip';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file uploads
  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages: ProcessedImage[] = Array.from(files).map((file) => ({
      id: generateId(),
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      processedUrl: null, // Initially null until processed
      name: file.name,
      status: 'pending',
      width: 0, 
      height: 0
    }));

    // Get original dimensions
    newImages.forEach(img => {
       const i = new Image();
       i.onload = () => {
         setImages(prev => prev.map(p => p.id === img.id ? {...p, width: i.width, height: i.height} : p));
       };
       i.src = img.originalUrl;
    });

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
        const target = prev.find(p => p.id === id);
        if (target) {
            URL.revokeObjectURL(target.originalUrl);
            if(target.processedUrl) URL.revokeObjectURL(target.processedUrl);
        }
        return prev.filter((img) => img.id !== id);
    });
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    
    const updatedImages = await Promise.all(
      images.map(async (img) => {
        try {
          const processedDataUrl = await processImage(
            img.originalFile,
            width,
            height,
            fitMode
          );
          return {
            ...img,
            processedUrl: processedDataUrl,
            status: 'done' as const,
          };
        } catch (error) {
          console.error(error);
          return { ...img, status: 'error' as const };
        }
      })
    );

    setImages(updatedImages);
    setIsProcessing(false);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const processedImages = images.filter(img => img.status === 'done' && img.processedUrl);
    
    if (processedImages.length === 0) return;

    processedImages.forEach((img) => {
      if (img.processedUrl) {
        // Remove header "data:image/png;base64,"
        const base64Data = img.processedUrl.split(',')[1];
        zip.file(`batch_${img.name}`, base64Data, { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Batch_Joselito_Pack.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasProcessedImages = images.some(img => img.status === 'done');

  return (
    <div className="flex h-screen bg-black text-gray-100 overflow-hidden font-sans selection:bg-blue-500/30">
      
      <ControlPanel 
        width={width}
        height={height}
        fitMode={fitMode}
        setWidth={setWidth}
        setHeight={setHeight}
        setFitMode={setFitMode}
        onProcess={handleProcess}
        isProcessing={isProcessing}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-medium text-white">Espacio de Trabajo</h2>
              <p className="text-sm text-gray-500">{images.length} imágenes cargadas</p>
            </div>
            
            <div className="flex gap-3">
              {hasProcessedImages && (
                 <button 
                  onClick={handleDownloadAll}
                  className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
                 >
                   <Archive className="w-4 h-4" /> Descargar Todo (ZIP)
                 </button>
              )}
              
              {images.length > 0 && (
                  <button 
                    onClick={() => setImages([])} 
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 border border-red-900/30 hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                  >
                      <Trash2 className="w-4 h-4" /> Limpiar
                  </button>
              )}
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            
            {images.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-full max-w-xl">
                        <ImageUploader onUpload={handleUpload} />
                        <div className="mt-8 text-center text-gray-600 text-sm">
                          <p>💡 Tip: Usa la IA en el panel lateral para elegir el tamaño perfecto.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                    <div className="col-span-full mb-4">
                        <ImageUploader onUpload={handleUpload} />
                    </div>
                    
                    {images.map((img) => (
                        <div key={img.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group hover:border-gray-700 transition-all flex flex-col shadow-xl">
                            {/* Preview Area */}
                            <div className="relative aspect-video bg-gray-950/50 flex items-center justify-center overflow-hidden border-b border-gray-800">
                                {/* Checkerboard pattern for transparency */}
                                <div className="absolute inset-0 opacity-10" 
                                     style={{backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'}} 
                                />
                                
                                <img 
                                    src={img.processedUrl || img.originalUrl} 
                                    alt={img.name} 
                                    className="relative max-w-full max-h-full object-contain z-10"
                                />
                                
                                {img.status === 'done' && (
                                    <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30 font-medium z-20 shadow-sm backdrop-blur-sm">
                                        Redimensionado
                                    </div>
                                )}
                            </div>

                            {/* Info Area */}
                            <div className="p-4 flex flex-col gap-2 flex-grow">
                                <div className="flex justify-between items-start">
                                    <div className="overflow-hidden">
                                        <h3 className="text-sm font-medium text-white truncate" title={img.name}>{img.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {img.status === 'done' ? (
                                                <span className="flex items-center gap-1 text-green-400 font-mono">
                                                     {width} x {height} px
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 font-mono text-gray-600">
                                                     Orig: {img.width || '...'} x {img.height || '...'} px
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => removeImage(img.id)}
                                        className="text-gray-600 hover:text-red-400 transition-colors p-1 hover:bg-red-400/10 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mt-auto pt-3">
                                    {img.status === 'done' && img.processedUrl ? (
                                        <a 
                                            href={img.processedUrl} 
                                            download={`resized_${width}x${height}_${img.name}`}
                                            className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2 rounded-lg transition-colors border border-gray-700 hover:border-gray-600"
                                        >
                                            <ArrowDownCircle className="w-4 h-4" /> Descargar
                                        </a>
                                    ) : (
                                        <div className="text-center py-2 text-xs text-gray-600 bg-gray-900/50 rounded-lg border border-gray-800/50">
                                            {img.status === 'error' ? 'Error al procesar' : 'Listo para procesar'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;