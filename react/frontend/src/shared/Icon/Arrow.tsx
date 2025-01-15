import React from "react";

interface ArrowProps {
    className?: string
    right?: boolean
}

const Arrow: React.FC<ArrowProps> = () => {
    return (
<svg xmlns="http://www.w3.org/2000/svg" width="86" height="86" viewBox="0 0 86 86" fill="none">
    <path fill="currentColor" d="M45.0756 17.9623L69.5664 42.4476L66.5098 45.5042L45.7055 24.7053L45.7055 68.4722L41.3836 68.4722L41.3836 24.7053L20.5793 45.5042L17.5227 42.4476L42.019 17.9623C42.8626 17.1187 44.232 17.1187 45.0756 17.9623Z" />
</svg>
    );
}

export default Arrow;
