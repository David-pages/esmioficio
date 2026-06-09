
import React from 'react';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[310]"
      >
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img loading="lazy" 
          src={images[currentIndex]} 
          alt={`Imagen ${currentIndex + 1}`} 
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        />

        {images.length > 1 && (
          <>
            <button 
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-primary hover:text-black transition-colors backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <button 
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-primary hover:text-black transition-colors backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-2xl">arrow_forward</span>
            </button>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
