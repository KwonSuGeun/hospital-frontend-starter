import sidebarReducer from "@/features/sidebar/slice/sidebarSlice";
import staffReducer from "@/features/staff/slice/staffSlice";
import {combineReducers} from "redux";


const RootReducer= combineReducers({
    sidebar: sidebarReducer, // layout — sidebar.tsx
    staff: staffReducer, // /staff, /staff/[id], /staff/register
    });

export default RootReducer;