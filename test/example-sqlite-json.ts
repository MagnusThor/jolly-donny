import {
  OfflineStorage,
  PersistedEntityBase,
  SQLiteJsonProvider,
  SQLiteLocalStorage,
} from '../src/index';

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

        const provider = new SQLiteJsonProvider();

        const persistedData = SQLiteLocalStorage.load("testDb");

         provider.init("testDb",persistedData).then(async () => {

            for(let i=0; i < 5; i++) {
                const newNote: Note = {
                    id: crypto.randomUUID(),
                    title: `New Note ${i}`,
                    body: "This is a new note.",
                    created: Date.now(),
                    lastModified:  Date.now()
                };
                await provider.update('notes', newNote);
            };

            logger("Created a bunch of notes.");

            const allNotes = await provider.all<Note>('notes');

            console.log("Number of notes", allNotes.length);

            const last = allNotes.take(1).lastOrDefault();

            logger("lastOrDefault -->", last);

            // find first Note using title

            const firstNote = await provider.find<Note>('notes', (note) => note.title === 'New Note 0');

            logger('First Note:', firstNote);

            // export the database for persistance

            const exportedDb =  provider.exportDb();

            SQLiteLocalStorage.save(exportedDb, "testDb");

            


         }).catch((error) => {
            console.error("Error initializing SQLite provider:", error);
         });
    }
}


document.addEventListener('DOMContentLoaded', () => {

    const testApp = new TestClint()

});