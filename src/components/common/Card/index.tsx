import React from "react";

interface CardProps {
    children: React.ReactNode;
}

const Card = ({ children }: CardProps) => {
    return <div className="bg-card-gradient border border-card-border rounded-2xl">{children}</div>;
};

export default Card;
