import react from "react";

export default function Header() {
    return (    
        <header className="h-16 w-full bg-slate-950 flex items-start flex-col justify-start gap-1"> 
            <h1 className="text-3xl font-semibold text-gray-300 font ">Dashboard</h1>
            <p className="text-md text-gray-400">Ethics monitoring and conflict of interest detection overview</p>
         </header>
    );
}
