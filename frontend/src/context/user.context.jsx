import React, { createContext, useState, useContext } from 'react';

// Create the context
export const UserContext = createContext();
// Create the provider
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
