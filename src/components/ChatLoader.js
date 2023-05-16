import {IconDots} from "@tabler/icons-react";

export const ChatLoader = () => {
    return (
        <div className="flex flex-col flex-start">
            <div
                className={`flex items-center bg-stone-700 text-neutral-900 rounded-2xl px-4 py-2 w-fit`}
                style={{overflowWrap:"anywhere"}}
            >
                <IconDots className='text-white animate-bounce'/>
            </div>
        </div>
    )
};