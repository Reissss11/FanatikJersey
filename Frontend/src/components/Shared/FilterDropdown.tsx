import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './FilterDropdown.css';

interface FilterDropdownProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    activeCount?: number;
    onClear?: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ title, children, defaultOpen = false, activeCount = 0, onClear }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClear) onClear();
    };

    return (
        <div className={`filter-dropdown ${isOpen ? 'open' : ''}`}>
            <button
                className="filter-dropdown-header"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="filter-title-group">
                    <span className="filter-title">{title}</span>
                    {activeCount > 0 && (
                        <span className="filter-badge">{activeCount}</span>
                    )}
                </div>
                <div className="filter-actions_right">
                    {activeCount > 0 && onClear && (
                        <span
                            className="filter-clear-btn"
                            onClick={handleClear}
                            title="Limpar filtro"
                        >
                            Limpar
                        </span>
                    )}
                    <span className="filter-icon">
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                </div>
            </button>

            <div className={`filter-dropdown-content ${isOpen ? 'expanded' : ''}`}>
                <div className="filter-content-inner">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FilterDropdown;
