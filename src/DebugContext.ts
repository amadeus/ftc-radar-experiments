import {createContext} from 'react';

// NOTE(amadeus): I may want to turn this into an object in the future where we
// can store multiple different types of settings
export default createContext<boolean>(false);
