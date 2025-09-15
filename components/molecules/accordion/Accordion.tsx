"use client";
import { useState, useRef, useEffect } from 'react';
import styles from './Accordion.module.scss';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Accordion = ({ title, children, icon }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isOpen ? `${contentRef.current.scrollHeight}px` : '0px';
    }
  }, [isOpen]);

  return (
    <div className={styles.accordion}>
      <button className={styles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </div>
        <span className={`${styles.icon} ${isOpen ? styles.open : ''}`}>&#9660;</span>
      </button>
      <div ref={contentRef} className={styles.accordionContent}>
        <div className={styles.contentPadding}>{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
