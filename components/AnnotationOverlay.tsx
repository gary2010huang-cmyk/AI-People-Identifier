import React from 'react';
import { Person } from '../types';

interface AnnotationOverlayProps {
  people: Person[];
  imageWidth: number;
  imageHeight: number;
}

const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({ people }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      {people.map((person, index) => {
        const [ymin, xmin, ymax, xmax] = person.box_2d;

        // Convert 1000-scale coordinates to percentages
        const top = ymin / 10;
        const left = xmin / 10;
        const height = (ymax - ymin) / 10;
        const width = (xmax - xmin) / 10;

        return (
          <div
            key={`${person.name}-${index}`}
            className="absolute border-2 border-cyan-400 bg-cyan-400/10 transition-all duration-500 ease-out hover:bg-cyan-400/20 hover:border-cyan-300 group"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          >
            {/* Label Tag */}
            <div className="absolute -top-8 left-0 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 group-hover:scale-105 transition-transform origin-bottom-left">
              {person.name}
            </div>
            
            {/* Corner Accents for tech look */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white opacity-50"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white opacity-50"></div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnotationOverlay;