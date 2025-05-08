import React, { useEffect, useRef, useState } from "react";
import { useAccountStore } from "@/stores/useAccountStore";
import { useStoreProfileStore } from "@/stores/useStoreProfileStore";
import "./Header.css";

const Header: React.FC = () => {
    const { user, isLoggedIn, logout } = useAccountStore();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const profile = useStoreProfileStore((state) => state.profile);
    const profileDisplayName =
        profile?.display_name || profile?.name || null;
    const profilePicture = profile?.picture || null;

    const [displayName, setDisplayName] = useState<string>("");

    const formatNpub = (npub: string): string =>
        `${npub.substring(0, 8)}...${npub.substring(npub.length - 8)}`;

    const handleLogout = () => {
        logout();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (profileDisplayName) {
            setDisplayName(profileDisplayName);
        } else if (user?.npub) {
            setDisplayName(formatNpub(user.npub));
        }
    }, [profileDisplayName, user?.npub]);

    return (
        <section className="header h-[var(--header-height)] w-screen mx-auto px-4 flex justify-between items-center border-b-2">
            {/* Logo/Title */}
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-800 mr-2">
                    Merchant Portal
                </h1>
                <h5>Powered by Conduit</h5>
            </div>

            {/* Account Dropdown */}
            {isLoggedIn && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        {/* Avatar */}
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover border border-gray-300"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                {displayName ? displayName.charAt(0).toUpperCase() : "N"}
                            </div>
                        )}

                        <span className="hidden sm:inline text-sm font-medium">
                            {displayName || formatNpub(user?.npub || "xxx")}
                        </span>

                        {/* Dropdown Arrow */}
                        <svg
                            className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                                <div className="px-4 py-2 border-b">
                                    <p className="text-xs text-gray-500">Signed in as</p>
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {formatNpub(user?.npub || "xxx")}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default Header;
