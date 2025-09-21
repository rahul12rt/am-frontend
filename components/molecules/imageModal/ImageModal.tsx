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

  useEffect(() => {
    setIsVisible(true); // Trigger the fade-in animation
    
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (!mountedRef.current) return;
    
    setIsVisible(false); // Start fade-out animation
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        onClose();
      }
    }, 300); // Delay close until fade-out finishes
  };

  const handleModalClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-22 transition-opacity duration-300 
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
      style={{ backdropFilter: "blur(20px)" }}
      onClick={handleModalClick}
    >
      <div
        className={`relative w-[768px] h-[75vh] rounded-[8px] transition-transform duration-300 transform 
          ${isVisible ? "scale-100" : "scale-95"}
        `}
      >
        <button
          onClick={handleClose}
          className="absolute top-[-10px] right-[-10px] bg-gray-700 text-white rounded-full flex items-center justify-center z-[1] w-[28px] h-[28px] text-[1.2rem] border border-gray-500 shadow-lg hover:bg-red-600 hover:border-red-500 transition-all duration-300 max-[768px]:right-[15px] max-[768px]:top-[8px]"
        >
          ✕
        </button>

        <Image
          src={`/images/${selectedImage}`}
          alt="gallery"
          fill
          className="object-cover rounded-[8px] max-[768px]:p-[20px]"
        />
      </div>
    </div>
  );
};

export default ImageModal;
