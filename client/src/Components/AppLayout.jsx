import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout(){
    return(
        <div className="grid grid-cols-[200px_1fr] min-h-screen bg-gray-50">
            <Sidebar />
            <main className="p-6">
                <Header />
                {<Outlet />}
            </main>
        </div>
    )
}