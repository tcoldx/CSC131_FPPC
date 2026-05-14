"use client";
import react, {useRef} from "react";
import {useRouter} from 'next/navigation';
import { on } from "events";


export function NavCard({od, onSelect}: any) {
    const buttonRef = useRef<any>(0);
    const router = useRouter();
    const handleSelection = (_id: string) => {
        onSelect();
        router.push(`/officials/${_id}`);
    };
    
    return (
                    <div
                        onClick={() => {
                            handleSelection(od._id);
                        }}
                        ref={buttonRef}
                        key={od._id}
                        className="p-2 hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                      >
                        <div className="font-medium">
                          {od.firstName} {od.lastName}
                        </div>
                        <div className="text-xs text-gray-400">
                          Agency: {od.citySlug ? `${od.citySlug}` : ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          Desc: {`${od.businessDescription}`}
                        </div>
                      </div>
    )
}