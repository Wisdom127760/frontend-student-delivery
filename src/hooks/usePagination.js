// hooks/usePagination.js
import { useState, useMemo } from 'react';
import { PAGINATION } from '../utils/constants';

export const usePagination = (initialPage = PAGINATION.DEFAULT_PAGE, initialLimit = PAGINATION.DEFAULT_LIMIT) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);

    const pagination = useMemo(() => ({
        page: currentPage,
        limit,
        offset: (currentPage - 1) * limit,
    }), [currentPage, limit]);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, page));
    };

    const nextPage = () => {
        setCurrentPage(prev => prev + 1);
    };

    const prevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const changeLimit = (newLimit) => {
        setLimit(newLimit);
        setCurrentPage(1); // Reset to first page when changing limit
    };

    const reset = () => {
        setCurrentPage(initialPage);
        setLimit(initialLimit);
    };

    const getPaginationInfo = (total) => {
        const totalPages = Math.ceil(total / limit);
        const startItem = (currentPage - 1) * limit + 1;
        const endItem = Math.min(currentPage * limit, total);

        return {
            totalPages,
            startItem,
            endItem,
            total,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
        };
    };

    const getPageNumbers = (total, maxVisible = 5) => {
        const totalPages = Math.ceil(total / limit);

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const half = Math.floor(maxVisible / 2);
        let start = Math.max(currentPage - half, 1);
        let end = Math.min(start + maxVisible - 1, totalPages);

        if (end - start + 1 < maxVisible) {
            start = Math.max(end - maxVisible + 1, 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return {
        ...pagination,
        currentPage,
        limit,
        goToPage,
        nextPage,
        prevPage,
        changeLimit,
        reset,
        getPaginationInfo,
        getPageNumbers,
    };
};