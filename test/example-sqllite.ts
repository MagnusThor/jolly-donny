import {
  OfflineStorage,
  PersistedEntityBase,
  QueryableArray,
} from '../src/index';
import { SQLiteProvider } from '../src/storage/providers/SQLLiteProvider';

const logger = (...args: any[]) => {
    const p = document.createElement("p");
    p.textContent = JSON.stringify(args);
    document.querySelector("#output")?.append(p);
};


interface Note extends PersistedEntityBase {
    id: string;
    title: string;
    body: string;
}

export class TestClint {
    storage!: OfflineStorage;
   
    constructor() {

        const provider = new SQLiteProvider();

        logger("SQLiteProvider", provider);

         provider.init("testDb").then(async () => {

            for(let i=0; i < 10; i++) {
                const newNote: Note = {
                    id: crypto.randomUUID(),
                    title: `New Note ${i}`,
                    body: "This is a new note.",
                    created: Date.now(),
                    lastModified:  Date.now()
                };
                await provider.update('notes', newNote);
            };

            logger("Created a bunch of notes");

            const allNotes = new QueryableArray(...await provider.all<Note>('notes'));
            const queryResult = allNotes.take(1);//.firstOrDefault;
        
            logger("Query Result", queryResult);

         }).catch((error) => {
            console.error("Error initializing SQLite provider:", error);
         });
    }
}


document.addEventListener('DOMContentLoaded', () => {

    const testApp = new TestClint()

});