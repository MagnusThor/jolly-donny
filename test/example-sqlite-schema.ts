import {
  OfflineStorage,
  PersistedEntityBase,
  SQLiteLocalStorage,
  SQLiteSchemeProvider,
} from '../src/index';

const logger = (...args: any[]) => {
    const p = document.createElement("p");
    p.textContent = JSON.stringify(args);
    document.querySelector("#output")?.append(p);
};

export class Note extends PersistedEntityBase {
    constructor(
        public id: string,
        public title: string,
        public content: string,
        public created: number
    ) {
        super();
    }
}

export class TestClint {
    storage!: OfflineStorage;

    async runTest() {

        const persistedData = SQLiteLocalStorage.load("test_notes");
        const provider = new SQLiteSchemeProvider();
        
        await provider.init("test_notes", persistedData);

        // Create sample notes
        for(let i = 0; i < 5; i++) {  
            const note = new Note(crypto.randomUUID(), 'First Note', 'This is a test note', Date.now()); 
            await provider.update('notes', note); 
        }
    
         

        // Fetch all notes
        const allNotes = await provider.all<Note>('notes');
        logger('All Notes:', allNotes);

        // Find one
        const found = await provider.findById<Note>('notes', '2');
        logger('Found Note:', found);

        // find first Note using title

        const firstNote = await provider.find<Note>('notes', (note) => note.title === 'First Note');
        logger('First Note:', firstNote);


        // Delete one
        // await provider.delete('notes', note1);
        // const afterDelete = await provider.all<Note>('notes');
        // logger('After Delete:', afterDelete);

        
        SQLiteLocalStorage.save(provider.exportDb(),"test_notes");
    
        
    }

    constructor() {
        this.runTest().then(() => {
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const testApp = new TestClint()
});