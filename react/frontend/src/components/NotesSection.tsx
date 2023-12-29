import React, {useContext} from 'react'
import { ShortContext } from "../contexts/ShortContext";

const NotesSection: React.FC = () => {
    const currentShort = useContext(ShortContext)
    function addNewNote(event: any) {
        event.preventDefault();
        console.log("Add new note")
        return false;
    }

    return (
        <div className="bg-white-50 bg-opacity-50 p-3">
            <form className="flex flex-col" onSubmit={addNewNote}>
                <input
                    name="videoComment"
                    type="text"
                    placeholder="Leave your comments here"
                    className="bg-white-50 bg-opacity-50"
                />
                <div className="flex flex-row justify-end">
                    <input
                        type="submit"
                        value="Send"
                        className="hover:font-bold active:font-bold cursor-pointer"
                    />
                </div>
            </form>
        </div>
    )
}

export default NotesSection
