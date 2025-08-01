// hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = (apiFunction, dependencies = [], options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        immediate = true,
        onSuccess,
        onError,
        showErrorToast = true,
        showSuccessToast = false,
    } = options;

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiFunction(...args);

            setData(result);

            if (onSuccess) {
                onSuccess(result);
            }

            if (showSuccessToast && result?.message) {
                toast.success(result.message);
            }

            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
            setError(errorMessage);

            if (onError) {
                onError(err);
            }

            if (showErrorToast) {
                toast.error(errorMessage);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction, onSuccess, onError, showErrorToast, showSuccessToast]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, dependencies);

    const refetch = useCallback(() => {
        return execute();
    }, [execute]);

    return {
        data,
        loading,
        error,
        execute,
        refetch,
    };
};