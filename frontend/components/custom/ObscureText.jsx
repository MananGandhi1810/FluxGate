import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

function ObscureText({ text }) {
    const [hidden, setHidden] = useState(true);
    return (
        <span>
            {hidden ? text.replace(/./g, "*") : text}{" "}
            <button
                className="w-4 h-4"
                onClick={() => setHidden((prev) => !prev)}
            >
                {hidden ? (
                    <Eye className="w-5 h-5" />
                ) : (
                    <EyeOff className="w-5 h-5" />
                )}
            </button>
        </span>
    );
}

export default ObscureText;
