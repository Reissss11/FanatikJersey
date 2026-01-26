import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './PasswordInput.css';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ containerClassName, className, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={`password-input-container ${containerClassName || ''}`}>
            <input
                type={showPassword ? "text" : "password"}
                className={`password-input-field ${className || ''}`}
                {...props}
            />
            <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1} // Skip tab index for this button usually
                aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
            >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
        </div>
    );
};

export default PasswordInput;
