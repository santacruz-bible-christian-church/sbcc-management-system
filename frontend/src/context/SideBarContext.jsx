import { createContext, useContext } from "react";

const SideBarContext = createContext();

export const SideBarProvider = ({ children, value }) => {

    return (
        <SideBarContext.Provider value={value}>
            {children}
        </SideBarContext.Provider>
    )
};

export const useSideBar = () => useContext(SideBarContext);