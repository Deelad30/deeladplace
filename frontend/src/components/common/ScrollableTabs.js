import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../../styles/shared/PremiumShared.css';

const ScrollableTabs = ({ children, className = '' }) => {
    const scrollRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeft(scrollLeft > 0);
        setShowRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px tolerance
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            checkScroll();
            el.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                el.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [children]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={`scrollable-tabs-container ${className}`}>
            {showLeft && (
                <button 
                    className="scroll-btn left" 
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
            )}
            
            <div className="premium-tabs scroll-content" ref={scrollRef}>
                {children}
            </div>

            {showRight && (
                <button 
                    className="scroll-btn right" 
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            )}
        </div>
    );
};

export default ScrollableTabs;
