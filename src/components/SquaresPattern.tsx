interface SquaresPatternProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function SquaresPattern({ size = 'medium', className = '' }: SquaresPatternProps) {
  const squareSize = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
  };

  const gap = {
    small: 'gap-1',
    medium: 'gap-1.5',
    large: 'gap-2',
  };

  // Pattern: alternating colors in a grid
  const pattern = [
    ['blue', 'blue-light', 'blue', 'red', 'blue', 'blue-light', 'blue', 'blue', 'red', 'blue'],
    ['blue-light', 'red', 'blue', 'blue-light', 'blue', 'red', 'blue-light', 'blue', 'blue-light', 'red'],
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-[#DC2626]';
      case 'blue':
        return 'bg-[#1E3A8A]';
      case 'blue-light':
        return 'bg-[#3B82F6]';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className={`flex flex-col ${gap[size]} ${className}`}>
      {pattern.map((row, rowIndex) => (
        <div key={rowIndex} className={`flex ${gap[size]}`}>
          {row.map((color, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${squareSize[size]} ${getColorClass(color)}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
