import React, { createContext, useContext, useReducer } from 'react';

const NavigationContext = createContext();

const navigationReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: !state.isDrawerOpen };
    case 'SET_DRAWER':
      return { ...state, isDrawerOpen: action.payload };
    case 'TOGGLE_MINI':
      return { ...state, isMiniDrawer: !state.isMiniDrawer };
    default:
      return state;
  }
};

export const NavigationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(navigationReducer, {
    isDrawerOpen: window.innerWidth >= 900,
    isMiniDrawer: false
  });

  return (
    <NavigationContext.Provider value={{ state, dispatch }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
