import { createContext, useContext } from "react";

// This is for a global responsive hook for all pages in regards to the sidebar

const SideBarContext = createContext();

export const SideBarProvider = ({ children, value }) => {

    return (
        <SideBarContext.Provider value={value}>
            {children}
        </SideBarContext.Provider>
    )
};

export const useSideBar = () => useContext(SideBarContext);