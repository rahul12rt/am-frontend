import Image from 'next/image';

interface ImageModalProps {
  selectedImage: string;
  onClose: () => void;
}

const ImageModal = ({ selectedImage, onClose }: ImageModalProps) => {
  const handleModalClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 flex items-center justify-center z-22'
      style={{ backdropFilter: 'blur(20px)' }}
      onClick={handleModalClick}
    >
      <div className='relative w-[768px] h-[75vh] rounded-[8px]'>
        <button
          onClick={onClose}
          className='absolute top-[-10px] right-[-10px] text-white rounded-full flex items-center justify-center z-[1] w-[22px] h-[22px] text-[1.6rem] border-[1px]'
        >
          x
        </button>
        <Image
          src={`/images/${selectedImage}`}
          alt='gallery'
          fill
          className='object-cover rounded-[8px]'
        />
      </div>
    </div>
  );
};

export default ImageModal;
