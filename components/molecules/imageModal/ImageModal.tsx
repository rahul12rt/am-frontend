import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface ImageModalProps {
  selectedImage: string;
  onClose: () => void;
}

const ImageModal = ({ selectedImage, onClose }: ImageModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const handleClose = () => {
    if (!mountedRef.current) return;
    
    setIsVisible(false); // Start fade-out animation
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        onClose();
      }
    }, 300); // Delay close until fade-out finishes
  };

  useEffect(() => {
    setIsVisible(true); // Trigger the fade-in animation
    
    // Add keyboard event listener for Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleModalClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 bg-black bg-opacity-50
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
      style={{ backdropFilter: "blur(20px)" }}
      onClick={handleModalClick}
    >
      <div
        className={`relative w-[768px] h-[75vh] rounded-[8px] transition-transform duration-300 transform max-[768px]:w-[90vw] max-[768px]:h-[70vh]
          ${isVisible ? "scale-100" : "scale-95"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-[-15px] right-[-15px] bg-red-600 text-white rounded-full flex items-center justify-center z-[9999] w-[35px] h-[35px] text-[1.4rem] border-2 border-white shadow-2xl hover:bg-red-700 hover:scale-110 transition-all duration-200 max-[768px]:right-[5px] max-[768px]:top-[5px] max-[768px]:w-[40px] max-[768px]:h-[40px] font-bold cursor-pointer"
          type="button"
          aria-label="Close modal"
        >
          ✕
        </button>

        <Image
          src={`/images/${selectedImage}`}
          alt="gallery"
          fill
          className="object-cover rounded-[8px] max-[768px]:p-[20px]"
          priority
        />
      </div>
    </div>
  );
};

export default ImageModal;
