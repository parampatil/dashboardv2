import React from "react";

const ThreeDotsLoader = () => {
    return (
    <span className="inline-flex items-center space-x-1">
        <span className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
        <span className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
        <span className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
        <style jsx>{`
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(1); }
            40% { transform: scale(1.5); }
        }
        .animate-bounce {
            animation: bounce 1s infinite;
        }
        `}</style>
  </span>

    )
}

export default ThreeDotsLoader;