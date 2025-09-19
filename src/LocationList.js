import { useEffect, useRef, useState } from 'react';
import './LocationList.css';

const LocationList = ({ locations, onSelect }) => {
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const animationRef = useRef(null);

  const [buttonWidth, setButtonWidth] = useState(100);

  // update button width whenever number of locations changes
  useEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const numButtons = Math.max(1, locations.length);
    const newWidth = Math.max(80, containerWidth / numButtons - 16);
    setButtonWidth(newWidth);
  }, [locations]);

  // animation loop
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let pos = 0;

    function animate() {
      if (!slider) return;
      pos -= 1; // pixels per frame
      const totalWidth = slider.scrollWidth / 2;
      if (Math.abs(pos) >= totalWidth) pos = 0;
      slider.style.transform = `translateX(${pos}px)`;
      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [locations, buttonWidth]);

  return (
    <div className="location-list-container" ref={containerRef}>
      <div className="location-list-slider" ref={sliderRef}>
        {locations.map((loc) => (
          <button
            key={loc.id}
            className="location-button"
            style={{ minWidth: `${buttonWidth}px` }}
            onClick={() => onSelect(loc)}
          >
            {loc.name}
          </button>
        ))}
        {locations.map((loc) => (
          <button
            key={loc.id + '-duplicate'}
            className="location-button"
            style={{ minWidth: `${buttonWidth}px` }}
            onClick={() => onSelect(loc)}
          >
            {loc.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LocationList;
