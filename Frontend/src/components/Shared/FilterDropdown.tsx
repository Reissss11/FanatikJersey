import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './FilterDropdown.css';

interface FilterDropdownProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onClick?: () => void;
    activeCount?: number;
    selectedLabel?: string;
    onClear?: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ title, children, isOpen, onClick, activeCount = 0, selectedLabel, onClear }) => {
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClear) onClear();
    };

    return (
        <div className={`filter-dropdown ${isOpen ? 'open' : ''}`}>
            <button
                className="filter-dropdown-header"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <div className="filter-title-group">
                    <span className="filter-title">{title}</span>
                    {selectedLabel ? (
                        <span className="filter-selected-label">{selectedLabel}</span>
                    ) : (
                        activeCount > 0 && <span className="filter-badge">{activeCount}</span>
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

            {isOpen && (
                <div className="filter-dropdown-content-popover">
                    <div className="filter-content-inner">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
