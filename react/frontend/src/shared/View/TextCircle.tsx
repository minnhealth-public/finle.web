import React, { useEffect, useRef, useState } from 'react';


interface TextCircleProps extends React.ComponentProps<"div"> {
  text: string
  color?: string
  flipped?: boolean

}

const TextCircle: React.FC<TextCircleProps> = ({ text, color, flipped, ...props }) => {

  const textRef = useRef(null);
  const svgRef = useRef(null);
  const [borderWidth, setBorderWidth] = useState<string>("1px");

  useEffect(() => {
    // JSDom tests don't support getBBox
    if (textRef.current.getBBox) {
      const bbox = textRef?.current?.getBBox()
      svgRef.current.setAttribute('viewBox', [bbox.x, bbox.y, bbox.width, bbox.height].join(' '));
      setBorderWidth(`${bbox.width * 0.08}px`);
    }
  }, [textRef.current])

  const getStyle = () => {
    if (flipped)
      return { borderColor: color, borderWidth: borderWidth, background: 'white' };
    else
      return { backgroundColor: color };
  }

  return (
    <div
      className={`w-full h-full rounded-full flex flex-row ${props.className || ""}`}
      style={getStyle()}
    >
      <svg ref={svgRef} className="font-bold uppercase h-3/5 m-auto text-center">
        <text ref={textRef} fontSize="16px" dominantBaseline="middle" textAnchor="middle" fill={`${flipped ? color : "white"}`}>
          {text}
        </text>
      </svg>
    </div>
  )
}

export default TextCircle;
