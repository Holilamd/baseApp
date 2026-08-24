import React, { useState, useEffect, useRef } from 'react';
import { Combobox } from '@headlessui/react';
import { Check, ChevronDown, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AsyncSelect({ 
    apiEndpoint, 
    value, 
    onChange, 
    placeholder = "Cari...", 
    displayKey = "name",
    valueKey = "id",
    renderOption = null,
    className = "",
    error = null
}) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const debounceTimeout = useRef(null);

    // Initial load for default value if needed (we can skip this for simple forms or pass selectedOption explicitly)
    useEffect(() => {
        if (!value) {
            setSelectedOption(null);
        }
    }, [value]);

    useEffect(() => {
        if (!query && !isLoading) {
            return;
        }

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${apiEndpoint}?q=${encodeURIComponent(query)}`);
                setOptions(response.data);
            } catch (err) {
                console.error("Error fetching async options:", err);
                setOptions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimeout.current);
    }, [query, apiEndpoint]);

    const handleSelect = (option) => {
        setSelectedOption(option);
        onChange(option ? option[valueKey] : null);
    };

    return (
        <div className={`relative w-full ${className}`}>
            <Combobox value={selectedOption} onChange={handleSelect} nullable>
                <div className="relative">
                    <div className={`relative w-full cursor-default overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950 text-left border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand'} transition-colors sm:text-sm`}>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </div>
                        <Combobox.Input
                            className="w-full border-none py-2.5 pl-10 pr-10 text-sm leading-5 text-slate-900 dark:text-white bg-transparent focus:ring-0"
                            displayValue={(opt) => opt ? (typeof renderOption === 'function' ? renderOption(opt, true) : opt[displayKey]) : ''}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={placeholder}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown
                                className="h-5 w-5 text-slate-400 hover:text-slate-500"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                    </div>
                    <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-900 py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 border border-slate-200 dark:border-slate-800 focus:outline-none sm:text-sm">
                        {isLoading && options.length === 0 ? (
                            <div className="relative cursor-default select-none py-3 px-4 text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Sedang mencari...
                            </div>
                        ) : options.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none py-3 px-4 text-slate-500 dark:text-slate-400 text-center">
                                Tidak ada data ditemukan.
                            </div>
                        ) : options.length === 0 && query === '' ? (
                            <div className="relative cursor-default select-none py-3 px-4 text-slate-500 dark:text-slate-400 text-center text-xs">
                                Ketik untuk mencari...
                            </div>
                        ) : (
                            options.map((option) => (
                                <Combobox.Option
                                    key={option[valueKey]}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors ${
                                            active ? 'bg-brand/10 text-brand' : 'text-slate-900 dark:text-slate-200'
                                        }`
                                    }
                                    value={option}
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {renderOption ? renderOption(option, false) : option[displayKey]}
                                            </span>
                                            {selected ? (
                                                <span
                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                        active ? 'text-brand' : 'text-brand'
                                                    }`}
                                                >
                                                    <Check className="h-4 w-4 font-bold" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </div>
            </Combobox>
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
}
