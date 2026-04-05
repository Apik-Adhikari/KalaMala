import React from "react";

const HighlightedText = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }

    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) => (
                regex.test(part) ? (
                    <mark key={i} className="bg-brand-yellow text-brand-dark px-0.5 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            ))}
        </span>
    );
};

export default HighlightedText;
